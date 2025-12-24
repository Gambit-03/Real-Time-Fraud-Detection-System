#!/bin/bash
# Start script for Railway deployment

# Install dependencies
pip install -r requirements.txt

# Train models if they don't exist
if [ ! -f "app/models/ml_models/isolation_forest.pkl" ]; then
    echo "Training ML models..."
    python -m app.models.train_models
fi

# Start the application
PORT=${PORT:-8000}
uvicorn app.main:app --host 0.0.0.0 --port $PORT

