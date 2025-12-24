from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database.models import Transaction, FraudAlert
from app.models.schemas import TransactionCreate, TransactionResponse, FraudDetectionResult
from app.services.fraud_detector import FraudDetector
from app.services.redis_client import redis_client
from app.services.websocket_manager import manager
from app.services.user_profile_service import update_user_profile

router = APIRouter()
fraud_detector = FraudDetector()

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Ingest a new transaction and perform real-time fraud detection"""
    
    # Check if transaction already exists
    existing = db.query(Transaction).filter(
        Transaction.transaction_id == transaction.transaction_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transaction already exists")

    # Get user profile for behavioral analysis
    user_profile = await redis_client.get_user_profile(transaction.user_id)

    # Convert transaction to dict for fraud detection
    transaction_dict = transaction.model_dump()
    if transaction_dict.get('timestamp') is None:
        transaction_dict['timestamp'] = datetime.now()
    
    # Convert datetime to ISO string for JSON serialization
    if isinstance(transaction_dict.get('timestamp'), datetime):
        transaction_dict['timestamp'] = transaction_dict['timestamp'].isoformat()

    # Perform fraud detection
    fraud_result = await fraud_detector.detect_fraud(transaction_dict, user_profile)

    # Create transaction record
    db_transaction = Transaction(
        user_id=transaction.user_id,
        transaction_id=transaction.transaction_id,
        amount=transaction.amount,
        merchant=transaction.merchant,
        category=transaction.category,
        location=transaction.location,
        latitude=transaction.latitude,
        longitude=transaction.longitude,
        timestamp=transaction.timestamp or datetime.now(),
        is_fraud=fraud_result['is_fraud'],
        risk_score=fraud_result['risk_score'],
        fraud_reason="; ".join(fraud_result['reasons']) if fraud_result['reasons'] else None
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Create fraud alert if detected (for high risk and fraud)
    # Lower threshold for demo: >= 50 for high risk alerts
    if fraud_result['is_fraud'] or fraud_result['risk_score'] >= 50:
        alert = FraudAlert(
            transaction_id=transaction.transaction_id,
            user_id=transaction.user_id,
            risk_score=fraud_result['risk_score'],
            alert_type=fraud_result['alert_type'],
            description="; ".join(fraud_result['reasons']),
            status="pending"
        )
        db.add(alert)
        db.commit()

        # Broadcast alert via WebSocket
        await manager.broadcast({
            "type": "fraud_alert",
            "data": {
                "transaction_id": transaction.transaction_id,
                "user_id": transaction.user_id,
                "risk_score": fraud_result['risk_score'],
                "alert_type": fraud_result['alert_type'],
                "description": "; ".join(fraud_result['reasons']),
                "timestamp": datetime.now().isoformat()
            }
        })

    # Update user profile in background
    background_tasks.add_task(
        update_user_profile,
        transaction.user_id,
        transaction_dict,
        db
    )

    # Cache transaction
    await redis_client.cache_transaction(
        transaction.transaction_id,
        transaction_dict
    )

    return db_transaction

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 500,  # Increased limit for better display
    user_id: str = None,
    db: Session = Depends(get_db)
):
    """Retrieve transaction history"""
    query = db.query(Transaction)
    
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    transactions = query.order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
    return transactions

@router.get("/transactions/stats")
async def get_transaction_stats(db: Session = Depends(get_db)):
    """Get real-time transaction statistics"""
    total_count = db.query(func.count(Transaction.id)).scalar() or 0
    total_amount = db.query(func.sum(Transaction.amount)).scalar() or 0
    
    fraud_count = db.query(func.count(Transaction.id)).filter(Transaction.is_fraud == True).scalar() or 0
    high_risk_count = db.query(func.count(Transaction.id)).filter(Transaction.risk_score >= 70).scalar() or 0
    
    avg_risk = db.query(func.avg(Transaction.risk_score)).scalar()
    avg_risk = float(avg_risk) if avg_risk else 0.0
    
    pending_alerts = db.query(func.count(FraudAlert.id)).filter(FraudAlert.status == 'pending').scalar() or 0
    
    return {
        "total_transactions": total_count,
        "total_amount": float(total_amount),
        "fraud_count": fraud_count,
        "high_risk_count": high_risk_count,
        "avg_risk_score": round(avg_risk, 2),
        "pending_alerts": pending_alerts
    }

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Get a specific transaction by ID"""
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction
