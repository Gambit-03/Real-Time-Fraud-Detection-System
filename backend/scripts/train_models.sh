#!/bin/bash
# Script to train ML models for fraud detection

echo "Training ML models for fraud detection..."
cd "$(dirname "$0")/.."
python -m app.models.train_models

echo "Models trained successfully!"
echo "Models saved to: app/models/ml_models/"

