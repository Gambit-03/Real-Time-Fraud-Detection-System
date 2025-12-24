from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TransactionCreate(BaseModel):
    user_id: str
    transaction_id: str
    amount: float = Field(gt=0)
    merchant: str
    category: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: Optional[datetime] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: str
    transaction_id: str
    amount: float
    merchant: str
    category: str
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    timestamp: datetime
    is_fraud: bool
    risk_score: Optional[float]
    fraud_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class FraudAlertResponse(BaseModel):
    id: int
    transaction_id: str
    user_id: str
    risk_score: float
    alert_type: str
    description: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True

class FraudDetectionResult(BaseModel):
    is_fraud: bool
    risk_score: float
    reasons: list[str]
    alert_type: str

