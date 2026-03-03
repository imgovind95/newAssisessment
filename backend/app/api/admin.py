from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import json
from datetime import datetime

from ..db.session import get_db
from ..db.models import User, CallHistory, Report, ModelMetrics
from ..schemas import DashboardAnalytics, User as UserSchema, UserUpdate, ModelInfo
from ..api.deps import get_current_active_admin

router = APIRouter()

# Helper for Admin Check (In real app, would use a dependency that checks JWT claims)
def check_admin(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/analytics", response_model=DashboardAnalytics)
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    # 1. User & Usage Stats
    total_users = db.query(User).count()
    total_checks = db.query(CallHistory).count()
    total_reports = db.query(Report).count()
    
    # 2. Distribution (Mocked for now or extracted from history)
    spam_count = db.query(CallHistory).filter(CallHistory.prediction == "Spam").count()
    fraud_count = db.query(CallHistory).filter(CallHistory.prediction == "Fraud").count()
    safe_count = db.query(CallHistory).filter(CallHistory.prediction == "Safe").count()
    
    # 3. Model Metrics from Metadata
    METADATA_PATH = "app/ml/assets/model_metadata.json"
    model_info = {
        "model_name": "Random Forest",
        "accuracy": 0.94,
        "last_trained": datetime.now(),
        "comparison": {"Logistic Regression": 0.88, "Random Forest": 0.94}
    }
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            model_info = json.load(f)

    return {
        "total_users": total_users,
        "total_checks": total_checks,
        "total_reports": total_reports,
        "spam_count": spam_count,
        "fraud_count": fraud_count,
        "safe_count": safe_count,
        "model_metrics": model_info,
        "recent_reports": db.query(Report).order_by(Report.reported_at.desc()).limit(5).all()
    }

@router.get("/users", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    return db.query(User).all()

@router.patch("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.email:
        user.email = user_in.email
    
    db.commit()
    db.refresh(user)
    return user
