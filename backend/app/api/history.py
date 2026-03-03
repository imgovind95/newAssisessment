from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from ..db.models import CallHistory, User
from .deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_user_history(
    skip: int = Query(0, description="Offset for pagination"),
    limit: int = Query(10, description="Limit for pagination, max 50", le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the call check history for the currently authenticated user.
    """
    history_records = (
        db.query(CallHistory)
        .filter(CallHistory.user_id == current_user.id)
        .order_by(CallHistory.checked_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Map to dictionary to avoid strictly needing a dedicated Pydantic model for this simple view
    return [
        {
            "id": r.id,
            "phone_number": r.phone_number,
            "prediction": r.prediction,
            "confidence": r.confidence,
            "risk_level": r.risk_level,
            "checked_at": r.checked_at.isoformat()
        } for r in history_records
    ]
