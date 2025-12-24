from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database.models import FraudAlert
from app.models.schemas import FraudAlertResponse

router = APIRouter()

@router.get("/fraud-alerts", response_model=List[FraudAlertResponse])
async def get_fraud_alerts(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Retrieve fraud alerts"""
    query = db.query(FraudAlert)
    
    if status:
        query = query.filter(FraudAlert.status == status)
    
    alerts = query.order_by(FraudAlert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/fraud-alerts/{alert_id}", response_model=FraudAlertResponse)
async def get_fraud_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific fraud alert by ID"""
    alert = db.query(FraudAlert).filter(FraudAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert

@router.patch("/fraud-alerts/{alert_id}")
async def update_alert_status(
    alert_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update fraud alert status"""
    alert = db.query(FraudAlert).filter(FraudAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    valid_statuses = ["pending", "reviewed", "resolved", "false_positive"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    alert.status = status
    if status in ["reviewed", "resolved", "false_positive"]:
        alert.reviewed_at = datetime.now()
    
    db.commit()
    db.refresh(alert)
    
    return {"message": "Alert status updated", "alert": alert}

