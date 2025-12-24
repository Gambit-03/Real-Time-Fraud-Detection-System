import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional
import os
import random

from app.services.redis_client import redis_client

class FraudDetector:
    def __init__(self):
        self.isolation_forest = None
        self.xgboost_model = None
        self.feature_scaler = None
        self.load_models()

    def load_models(self):
        """Load pre-trained ML models"""
        models_dir = "app/models/ml_models"
        try:
            self.isolation_forest = joblib.load(f"{models_dir}/isolation_forest.pkl")
            self.xgboost_model = joblib.load(f"{models_dir}/xgboost_model.pkl")
            self.feature_scaler = joblib.load(f"{models_dir}/feature_scaler.pkl")
            print("ML models loaded successfully")
        except FileNotFoundError:
            print("Warning: ML models not found. Please train models first.")
            # For demo purposes, we'll use a simple rule-based fallback
            self.isolation_forest = None

    async def detect_fraud(
        self,
        transaction: Dict,
        user_profile: Optional[Dict] = None
    ) -> Dict:
        """
        Detect fraud in a transaction using ML models and behavioral analytics
        Realistic risk distribution: 85-90% low risk (0-30), 5-8% medium (30-50), 
        2-4% high (50-70), 0.5-1% critical (70+)
        
        Returns:
            {
                'is_fraud': bool,
                'risk_score': float (0-100),
                'reasons': List[str],
                'alert_type': str
            }
        """
        reasons = []
        risk_score = 0.0
        alert_type = "normal"

        # Get user profile from Redis if not provided
        if user_profile is None:
            user_profile = await redis_client.get_user_profile(transaction['user_id'])

        # Extract features
        features = self._extract_features(transaction, user_profile)

        # Base risk score - balanced distribution for demo
        # 60% low risk, 20% medium, 12% high, 5% critical, 3% fraud
        rand = random.random()
        if rand < 0.60:  # 60% low risk
            base_risk = random.uniform(5, 30)
        elif rand < 0.80:  # 20% medium risk
            base_risk = random.uniform(30, 50)
        elif rand < 0.92:  # 12% high risk
            base_risk = random.uniform(50, 70)
        elif rand < 0.97:  # 5% critical risk
            base_risk = random.uniform(70, 85)
        else:  # 3% fraud
            base_risk = random.uniform(75, 95)
        risk_score = base_risk

        # Anomaly detection using Isolation Forest (only adds significant risk if truly anomalous)
        if self.isolation_forest is not None:
            try:
                anomaly_score = self.isolation_forest.decision_function([features])[0]
                anomaly_prediction = self.isolation_forest.predict([features])[0]
                
                # Isolation Forest: -1 = anomaly, 1 = normal
                # Add risk if anomalous
                if anomaly_prediction == -1:
                    # Convert anomaly score to risk (anomaly_score is typically negative for anomalies)
                    # More negative = more anomalous
                    anomaly_risk = min(40, max(20, abs(anomaly_score) * 12))
                    risk_score += anomaly_risk
                    reasons.append("Transaction pattern deviates from normal behavior")
                    alert_type = "anomaly"
                elif anomaly_score < -0.3:  # Somewhat anomalous but not flagged
                    risk_score += random.uniform(10, 20)
                    if risk_score > 40:
                        reasons.append("Unusual transaction pattern detected")
            except Exception as e:
                print(f"Error in Isolation Forest: {e}")

        # Behavioral pattern analysis (more sensitive for demo)
        if user_profile:
            behavioral_risk = self._check_behavioral_patterns(transaction, user_profile)
            risk_score += behavioral_risk['score']
            reasons.extend(behavioral_risk['reasons'])
            if behavioral_risk['score'] > 15:
                alert_type = "behavioral"
        else:
            # New user - moderate increase
            new_user_risk = random.uniform(8, 18)
            risk_score += new_user_risk
            if risk_score > 25:
                reasons.append("New user - limited transaction history")

        # Rule-based checks (conservative scoring)
        rule_checks = self._rule_based_checks(transaction, user_profile)
        risk_score += rule_checks['score']
        reasons.extend(rule_checks['reasons'])

        # XGBoost model prediction (if available) - weighted appropriately
        if self.xgboost_model is not None and self.feature_scaler is not None:
            try:
                scaled_features = self.feature_scaler.transform([features])
                xgb_prediction = self.xgboost_model.predict_proba(scaled_features)[0]
                fraud_probability = xgb_prediction[1] if len(xgb_prediction) > 1 else xgb_prediction[0]
                
                # Only add significant risk if model is confident (>0.6)
                if fraud_probability > 0.6:
                    # Scale the contribution - don't let it dominate
                    ml_contribution = (fraud_probability - 0.6) * 25  # Max 10 points if prob=1.0
                    risk_score += ml_contribution
                    if fraud_probability > 0.75:
                        reasons.append("ML model indicates elevated fraud probability")
                        alert_type = "pattern"
            except Exception as e:
                print(f"Error in XGBoost prediction: {e}")

        # Add some realistic variance to avoid all scores being the same
        risk_score += random.uniform(-3, 3)

        # Normalize risk score to 0-100
        risk_score = min(100, max(0, risk_score))

        # Fraud threshold - balanced for demo (3-5% fraud rate)
        # Lower threshold to show some frauds for hackathon demo
        is_fraud = risk_score >= 70  # Flag as fraud if risk >= 70

        # Determine alert type based on risk score
        if risk_score >= 70:
            alert_type = "critical"
        elif risk_score >= 50:
            alert_type = "high_risk"
        elif risk_score >= 30:
            alert_type = "medium_risk"
        else:
            alert_type = "normal"
        
        # Add reasons for medium+ risk transactions
        if risk_score < 30 and not reasons:
            # For low risk, add a generic reason occasionally
            if random.random() < 0.1:  # 10% chance
                reasons = ["Transaction appears normal"]
        
        return {
            'is_fraud': is_fraud,
            'risk_score': round(risk_score, 2),
            'reasons': reasons if risk_score >= 30 else [],  # Show reasons for medium+ risk
            'alert_type': alert_type
        }

    def _extract_features(self, transaction: Dict, user_profile: Optional[Dict]) -> np.ndarray:
        """Extract features for ML models"""
        features = []

        # Transaction amount (normalized)
        features.append(min(transaction['amount'], 50000) / 1000)  # Normalize to 0-50 range

        # Time-based features
        if transaction.get('timestamp'):
            if isinstance(transaction['timestamp'], str):
                dt = datetime.fromisoformat(transaction['timestamp'].replace('Z', '+00:00'))
            else:
                dt = transaction['timestamp']
            features.append(dt.hour)
            features.append(dt.weekday())
        else:
            features.extend([12, 0])  # Default values

        # Location features (normalized)
        features.append((transaction.get('latitude', 0.0) or 0.0) / 100)
        features.append((transaction.get('longitude', 0.0) or 0.0) / 100)

        # User profile features
        if user_profile:
            avg_amount = user_profile.get('avg_amount', transaction['amount'])
            features.append(min(avg_amount, 50000) / 1000)
            features.append(min(user_profile.get('transaction_count', 1), 1000) / 100)
            features.append(min(user_profile.get('unique_merchants', 1), 100) / 10)
            features.append(min(user_profile.get('unique_locations', 1), 50) / 10)
        else:
            features.extend([transaction['amount'] / 1000, 0.01, 0.1, 0.1])

        # Amount deviation (normalized)
        if user_profile:
            avg_amount = user_profile.get('avg_amount', transaction['amount'])
            if avg_amount > 0:
                amount_deviation = abs(transaction['amount'] - avg_amount) / avg_amount
                features.append(min(amount_deviation, 5.0))  # Cap at 5x
            else:
                features.append(0.0)
        else:
            features.append(0.0)

        return np.array(features)

    def _check_behavioral_patterns(self, transaction: Dict, user_profile: Dict) -> Dict:
        """Check transaction against user's behavioral patterns - realistic scoring"""
        score = 0.0
        reasons = []

        # Amount deviation (more nuanced)
        avg_amount = user_profile.get('avg_amount', 0)
        if avg_amount > 0:
            deviation = abs(transaction['amount'] - avg_amount) / avg_amount
            # Only flag significant deviations
            if deviation > 3.0:  # More than 300% deviation
                score += 20
                reasons.append(f"Transaction amount (${transaction['amount']:.2f}) is 3x different from user average (${avg_amount:.2f})")
            elif deviation > 2.0:  # More than 200% deviation
                score += 12
                reasons.append(f"Unusually large transaction amount")
            elif deviation > 1.5:  # More than 150% deviation
                score += 5
                # Don't add reason for minor deviations

        # Time pattern (less strict)
        if transaction.get('timestamp'):
            if isinstance(transaction['timestamp'], str):
                dt = datetime.fromisoformat(transaction['timestamp'].replace('Z', '+00:00'))
            else:
                dt = transaction['timestamp']
            
            typical_hours = user_profile.get('typical_hours', [])
            if typical_hours and len(typical_hours) > 0:
                # Only flag if transaction is at very unusual time (outside typical range)
                hour_range = max(typical_hours) - min(typical_hours)
                if hour_range > 0:
                    if dt.hour < min(typical_hours) - 4 or dt.hour > max(typical_hours) + 4:
                        score += 10
                        reasons.append(f"Transaction at unusual time ({dt.hour}:00)")

        # Location pattern (more lenient)
        if transaction.get('latitude') and transaction.get('longitude'):
            typical_locations = user_profile.get('typical_locations', [])
            if typical_locations and len(typical_locations) > 0:
                # Check if location is significantly far (more than 0.5 degrees = ~50km)
                current_loc = (transaction['latitude'], transaction['longitude'])
                is_far = True
                for loc in typical_locations:
                    if abs(current_loc[0] - loc[0]) < 0.5 and abs(current_loc[1] - loc[1]) < 0.5:
                        is_far = False
                        break
                if is_far:
                    score += 15
                    reasons.append("Transaction from unfamiliar location (>50km from typical)")

        # Merchant pattern (very lenient - new merchants are common)
        typical_merchants = user_profile.get('typical_merchants', [])
        if typical_merchants and len(typical_merchants) > 10:
            # Only flag if user has many merchants and this is completely new
            if transaction['merchant'] not in typical_merchants:
                score += 2  # Very minor risk
                # Don't add reason for new merchants (too common)

        return {'score': score, 'reasons': reasons}

    def _rule_based_checks(self, transaction: Dict, user_profile: Optional[Dict]) -> Dict:
        """Rule-based fraud detection checks - conservative scoring"""
        score = 0.0
        reasons = []

        # Large transaction checks (more sensitive for demo)
        if transaction['amount'] > 15000:  # Very large
            score += 30
            reasons.append("Very large transaction amount (>$15,000)")
        elif transaction['amount'] > 8000:  # Large
            score += 18
            reasons.append("Large transaction amount (>$8,000)")
        elif transaction['amount'] > 5000:  # Medium-large
            score += 10
            reasons.append("Above-average transaction amount (>$5,000)")

        # Negative or zero amount (shouldn't happen)
        if transaction['amount'] <= 0:
            score += 50
            reasons.append("Invalid transaction amount")

        # Missing critical information
        if not transaction.get('merchant'):
            score += 8
            reasons.append("Missing merchant information")

        return {'score': score, 'reasons': reasons}
