from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Detection Schemas ---
class CallCheckRequest(BaseModel):
    phone_number: str

class CallPrediction(BaseModel):
    phone_number: str
    label: str  # Safe, Spam, Fraud
    confidence: float
    risk_level: str  # Low, Medium, High
    recommendation: str

class CallHistoryItem(BaseModel):
    id: int
    phone_number: str
    prediction: str
    confidence: float
    risk_level: str
    checked_at: datetime

    class Config:
        from_attributes = True

# --- Reporting Schemas ---
class ReportCreate(BaseModel):
    phone_number: str
    report_type: str # Spam, Fraud
    description: Optional[str] = None

class ReportOut(ReportCreate):
    id: int
    reported_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# --- Admin & Analytics Schemas ---
class ComparisonStats(BaseModel):
    Logistic_Regression: float = Field(..., alias="Logistic Regression")
    Random_Forest: float = Field(..., alias="Random Forest")

class ModelInfo(BaseModel):
    model_name: str
    accuracy: float
    last_trained: datetime
    comparison: Dict[str, float]

class DashboardAnalytics(BaseModel):
    total_users: int
    total_checks: int
    total_reports: int
    spam_count: int
    fraud_count: int
    safe_count: int
    model_metrics: ModelInfo
    recent_reports: List[ReportOut]
