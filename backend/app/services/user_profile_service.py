from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Dict

from app.database.models import Transaction
from app.services.redis_client import redis_client

async def update_user_profile(user_id: str, transaction: Dict, db: Session):
    """Update user behavior profile based on new transaction"""
    
    # Get all user transactions
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.timestamp.desc()).limit(100).all()
    
    if not transactions:
        return
    
    # Calculate profile statistics
    amounts = [t.amount for t in transactions]
    merchants = [t.merchant for t in transactions]
    locations = [(t.latitude, t.longitude) for t in transactions if t.latitude and t.longitude]
    hours = [t.timestamp.hour for t in transactions if t.timestamp]
    
    profile = {
        'user_id': user_id,
        'transaction_count': len(transactions),
        'avg_amount': sum(amounts) / len(amounts) if amounts else 0,
        'max_amount': max(amounts) if amounts else 0,
        'min_amount': min(amounts) if amounts else 0,
        'unique_merchants': len(set(merchants)),
        'typical_merchants': list(set(merchants))[:10],  # Top 10 merchants
        'unique_locations': list(set(locations))[:5],  # Top 5 locations (convert tuples to lists for JSON)
        'typical_hours': list(set(hours)) if hours else [],
        'last_updated': datetime.now().isoformat()
    }
    
    # Convert location tuples to lists for JSON serialization
    profile['typical_locations'] = [list(loc) for loc in profile['typical_locations']]
    
    # Update in Redis
    await redis_client.update_user_profile(user_id, profile)

