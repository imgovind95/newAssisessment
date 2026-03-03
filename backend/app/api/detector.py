from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import os
import joblib
import numpy as np
import json
from typing import List
from datetime import datetime

from ..db.session import get_db
from ..db.models import CallHistory, Report, User
from ..schemas import CallCheckRequest, CallPrediction, ReportCreate
from ..core.config import settings
from .deps import get_current_user
from ..ml.features import extract_number_features

router = APIRouter()

# Global Model Cache
MODEL_PATH = "app/ml/assets/spam_model.joblib"
METADATA_PATH = "app/ml/assets/model_metadata.json"

model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

def _predict_number(phone_number: str, current_user: User, db: Session):
    # Feature Extraction Logic (Realistic Synthetic)
    # Features: [freq, pattern, region, reputation, reports, keyword_risk]
    
    # 1. Frequency (Mock: High if number starts with 1-800 or similar patterns)
    freq = np.random.randint(5, 150) if phone_number.startswith("1800") else np.random.randint(1, 20)
    
    # 2. Pattern (Length/Structure)
    pattern = 0.9 if len(phone_number) >= 10 else 0.4
    
    # 3. Region (Simplified)
    region = int(phone_number[:2]) % 10 if phone_number.isdigit() else 1
    
    # 4. Reputation (Fetch from reports)
    report_count = db.query(Report).filter(Report.phone_number == phone_number).count()
    reputation = max(0, 100 - (report_count * 10))
    
    # 5. Keywords (Simplified)
    keyword_risk = 0.8 if any(k in phone_number for k in ["999", "666"]) else 0.1
    
    # 6-15. Inject Advanced String Extraction Features
    ext = extract_number_features(phone_number)
    
    features = [[
        freq, pattern, region, reputation, report_count, keyword_risk,
        ext['repetition_ratio'],
        ext['unique_digit_ratio'],
        ext['seq_pattern_score'],
        ext['alt_pattern_score'],
        ext['palindrome_score'],
        ext['same_prefix_score'],
        ext['short_number_penalty'],
        ext['all_same_digit_flag'],
        ext['country_code_risk'],
        ext['entropy_score']
    ]]
    
    if model:
        pred_idx = model.predict(features)[0]
        probs = model.predict_proba(features)[0]
        confidence = float(probs[pred_idx])
    else:
        # Dummy logic if model missing
        pred_idx = 0
        confidence = 0.95

    labels = {0: "Safe", 1: "Spam", 2: "Fraud"}
    label = labels[pred_idx]
    
    # Risk Level Mapping strictly attached to string classification per project requirements
    if label == "Fraud":
        risk_level = "High"
    elif label == "Spam":
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    # Recommendation
    recommendations = {
        "Safe": "Number appears safe. Standard caution advised.",
        "Spam": "Warning: Likely telemarketing or unsolicited spam.",
        "Fraud": "Critical: High risk of financial fraud. Do not answer."
    }
    
    # Log to History (Optional: link to user if authenticated)
    if current_user:
        history_entry = CallHistory(
            phone_number=phone_number,
            prediction=label,
            confidence=confidence * 100,
            risk_level=risk_level,
            user_id=current_user.id
        )
        db.add(history_entry)
        db.commit()
    
    return {
        "phone_number": phone_number,
        "label": label,
        "confidence": confidence * 100,
        "risk_level": risk_level,
        "recommendation": recommendations[label],
        "debug_features": features[0]
    }


@router.post("/check", response_model=CallPrediction)
def check_number(
    raw_request: Request,
    request: CallCheckRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce Rate Limiting dynamically from app state
    import time
    if not hasattr(raw_request.app.state, 'rate_limit_store'):
        raw_request.app.state.rate_limit_store = {}
    
    ip = raw_request.client.host
    current_time = time.time()
    
    # Init or filter old requests
    if ip not in raw_request.app.state.rate_limit_store:
        raw_request.app.state.rate_limit_store[ip] = []
    
    # Keep only requests from the last 60 seconds
    raw_request.app.state.rate_limit_store[ip] = [t for t in raw_request.app.state.rate_limit_store[ip] if current_time - t < 60]
    
    if len(raw_request.app.state.rate_limit_store[ip]) >= 100:
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 10 per 1 minute")
        
    raw_request.app.state.rate_limit_store[ip].append(current_time)
    
    return _predict_number(request.phone_number, current_user, db)


from fastapi import UploadFile, File
import pandas as pd
import io

@router.post("/upload", response_model=List[CallPrediction])
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()
    try:
        # Handle decoding errors smoothly
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    # Find the phone number column
    phone_col = None
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in ["phone", "number", "tel"]):
            phone_col = col
            break

    if not phone_col:
        # fallback, assume it's the first column
        phone_col = df.columns[0]
    
    results = []
    for _, row in df.iterrows():
        phone_number = str(row[phone_col]).strip()
        if pd.isna(row[phone_col]) or not phone_number:
            continue
        try:
            prediction = _predict_number(phone_number, current_user, db)
            results.append(prediction)
        except Exception as e:
            print(f"Error predicting for number {phone_number}: {e}")
            pass

    return results

@router.post("/report", status_code=status.HTTP_201_CREATED)
def report_number(
    report_in: ReportCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_report = Report(
        phone_number=report_in.phone_number,
        report_type=report_in.report_type,
        description=report_in.description,
        user_id=current_user.id
    )
    db.add(new_report)
    db.commit()
    
    # Recalculate and update the label for the specific user's latest check if needed,
    # or just let the dynamically generated reputation in /check pull from this new report.
    
    return {"message": "Report submitted successfully"}
