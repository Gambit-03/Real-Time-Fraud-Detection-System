"""
Train ML models for fraud detection
Generates synthetic data and trains Isolation Forest and XGBoost models
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import joblib
import os
from datetime import datetime, timedelta
import random

def generate_synthetic_transactions(n_samples=10000, fraud_ratio=0.05):
    """Generate synthetic transaction data for training"""
    np.random.seed(42)
    random.seed(42)
    
    transactions = []
    fraud_count = int(n_samples * fraud_ratio)
    normal_count = n_samples - fraud_count
    
    # Generate normal transactions
    for i in range(normal_count):
        hour = np.random.choice([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], p=[0.05, 0.08, 0.1, 0.12, 0.1, 0.08, 0.1, 0.12, 0.1, 0.08, 0.05, 0.02])
        weekday = np.random.choice([0, 1, 2, 3, 4], p=[0.2, 0.2, 0.2, 0.2, 0.2])
        amount = np.random.lognormal(mean=3.5, sigma=1.0)  # Typical amounts
        amount = min(amount, 5000)  # Cap at $5000
        
        transactions.append({
            'amount': amount,
            'hour': hour,
            'weekday': weekday,
            'latitude': np.random.normal(40.7128, 0.1),  # NYC area
            'longitude': np.random.normal(-74.0060, 0.1),
            'avg_amount': amount * np.random.uniform(0.8, 1.2),
            'transaction_count': np.random.randint(10, 100),
            'unique_merchants': np.random.randint(5, 20),
            'unique_locations': np.random.randint(3, 10),
            'amount_deviation': abs(amount - amount * np.random.uniform(0.8, 1.2)),
            'is_fraud': 0
        })
    
    # Generate fraudulent transactions
    for i in range(fraud_count):
        # Fraud patterns: unusual hours, large amounts, far locations
        hour = np.random.choice([0, 1, 2, 3, 4, 5, 22, 23], p=[0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.2])
        weekday = np.random.choice([5, 6, 0, 1, 2, 3, 4], p=[0.1, 0.1, 0.15, 0.15, 0.15, 0.15, 0.2])
        amount = np.random.lognormal(mean=5.0, sigma=1.5)  # Larger amounts
        amount = min(amount, 50000)  # Can go up to $50k
        
        transactions.append({
            'amount': amount,
            'hour': hour,
            'weekday': weekday,
            'latitude': np.random.normal(40.7128, 1.0),  # Further from typical location
            'longitude': np.random.normal(-74.0060, 1.0),
            'avg_amount': amount * np.random.uniform(0.3, 0.7),  # Different from user average
            'transaction_count': np.random.randint(1, 20),  # Newer users more likely
            'unique_merchants': np.random.randint(1, 5),
            'unique_locations': np.random.randint(1, 3),
            'amount_deviation': abs(amount - amount * np.random.uniform(0.3, 0.7)),
            'is_fraud': 1
        })
    
    df = pd.DataFrame(transactions)
    return df

def extract_features(df):
    """Extract features for ML models"""
    features = [
        'amount', 'hour', 'weekday', 'latitude', 'longitude',
        'avg_amount', 'transaction_count', 'unique_merchants',
        'unique_locations', 'amount_deviation'
    ]
    X = df[features].values
    y = df['is_fraud'].values
    return X, y

def train_isolation_forest(X):
    """Train Isolation Forest for anomaly detection"""
    print("Training Isolation Forest...")
    model = IsolationForest(
        contamination=0.05,  # Expected fraud rate
        random_state=42,
        n_estimators=100
    )
    model.fit(X)
    print("Isolation Forest trained successfully")
    return model

def train_xgboost(X, y):
    """Train XGBoost for fraud classification"""
    print("Training XGBoost...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X, y)
    print("XGBoost trained successfully")
    return model

def main():
    """Main training function"""
    print("Generating synthetic transaction data...")
    df = generate_synthetic_transactions(n_samples=10000, fraud_ratio=0.05)
    
    print(f"Generated {len(df)} transactions ({df['is_fraud'].sum()} fraudulent)")
    
    # Extract features
    X, y = extract_features(df)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train models
    isolation_forest = train_isolation_forest(X_scaled)
    xgboost_model = train_xgboost(X_scaled, y)
    
    # Create models directory
    models_dir = "app/models/ml_models"
    os.makedirs(models_dir, exist_ok=True)
    
    # Save models
    print("Saving models...")
    joblib.dump(isolation_forest, f"{models_dir}/isolation_forest.pkl")
    joblib.dump(xgboost_model, f"{models_dir}/xgboost_model.pkl")
    joblib.dump(scaler, f"{models_dir}/feature_scaler.pkl")
    
    print(f"Models saved to {models_dir}/")
    
    # Evaluate models
    print("\nModel Evaluation:")
    print(f"Isolation Forest - Anomalies detected: {(isolation_forest.predict(X_scaled) == -1).sum()}")
    print(f"XGBoost - Accuracy: {xgboost_model.score(X_scaled, y):.4f}")
    
    # Feature importance
    feature_names = ['amount', 'hour', 'weekday', 'latitude', 'longitude',
                     'avg_amount', 'transaction_count', 'unique_merchants',
                     'unique_locations', 'amount_deviation']
    importances = xgboost_model.feature_importances_
    print("\nTop 5 Important Features:")
    for idx in np.argsort(importances)[-5:][::-1]:
        print(f"  {feature_names[idx]}: {importances[idx]:.4f}")

if __name__ == "__main__":
    main()

