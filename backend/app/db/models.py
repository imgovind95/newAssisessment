from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    history = relationship("CallHistory", back_populates="owner")
    reports = relationship("Report", back_populates="reporter")

class CallHistory(Base):
    __tablename__ = "call_history"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    prediction = Column(String)  # Spam, Fraud, Safe
    confidence = Column(Float)
    risk_level = Column(String) # High, Medium, Low
    checked_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="history")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    report_type = Column(String)  # Spam, Fraud
    description = Column(String)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    reporter = relationship("User", back_populates="reports")

class ModelMetrics(Base):
    __tablename__ = "model_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String)
    accuracy = Column(Float)
    last_trained = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(String) # JSON string of comparison stats
