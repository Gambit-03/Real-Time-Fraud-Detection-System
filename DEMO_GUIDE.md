# Demo Guide for Real-Time Fraud Detection System

## Quick Start

### 1. Start the System

```bash
# Using Docker (Recommended)
docker-compose up

# Or manually:
# Terminal 1: Start PostgreSQL and Redis
docker-compose up postgres redis

# Terminal 2: Start Backend
cd backend
pip install -r requirements.txt
python -m app.models.train_models  # Train ML models first
uvicorn app.main:app --reload

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### 2. Access the Dashboard

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Demo Script

### Step 1: Train ML Models (First Time Only)

```bash
cd backend
python -m app.models.train_models
```

This will:
- Generate 10,000 synthetic transactions
- Train Isolation Forest model
- Train XGBoost model
- Save models to `app/models/ml_models/`

### Step 2: Start the System

```bash
docker-compose up
```

### Step 3: Generate Demo Data

**Option A: Use the Dashboard Simulator**
1. Open http://localhost:5173
2. Click "Start Auto Simulation" in the Transaction Simulator panel
3. Watch transactions appear in real-time

**Option B: Use Python Script**
```bash
cd backend
pip install -r scripts/requirements.txt
python scripts/demo_data_generator.py 5 2  # Run for 5 minutes, send every 2 seconds
```

### Step 4: Demo Flow

1. **Show Real-Time Detection**
   - Start transaction simulation
   - Point out transactions appearing in real-time
   - Show risk scores being calculated instantly

2. **Demonstrate Fraud Alerts**
   - Wait for a high-risk transaction
   - Show alert appearing in the Fraud Alerts tab
   - Explain the detection reasons

3. **Show Behavioral Analytics**
   - Switch to Analytics tab
   - Show risk distribution charts
   - Explain how the system learns user patterns

4. **Explain False Positive Reduction**
   - Show how normal transactions get low risk scores
   - Explain behavioral learning reduces false alarms
   - Show alert status management

## Key Talking Points

### Tech Stack
- **Backend**: FastAPI (Python) - Industry standard for ML APIs
- **ML Models**: Isolation Forest + XGBoost - Same libraries used in production banking
- **Real-Time**: WebSockets + Redis - Mirrors Kafka in production
- **Frontend**: React + TypeScript - Modern, professional UI
- **Database**: PostgreSQL - Same as production systems

### Features to Highlight
1. **Real-Time Processing**: Transactions analyzed in <100ms
2. **Behavioral Learning**: System learns each user's patterns
3. **Multi-Model Approach**: Isolation Forest + XGBoost + Rule-based
4. **False Positive Reduction**: Behavioral analytics minimize false alarms
5. **Scalability**: Architecture supports Kafka, Spark in production

### Demo Scenarios

**Scenario 1: Normal Transaction**
- User makes a $50 purchase at Starbucks (usual location, normal time)
- Risk Score: 15-25 (Low)
- No alert generated

**Scenario 2: Large Transaction**
- User makes a $8,000 purchase at Best Buy
- Risk Score: 65-75 (Medium-High)
- Alert generated: "Transaction amount is significantly different from user average"

**Scenario 3: Unusual Location**
- User makes transaction from far location
- Risk Score: 70-85 (High)
- Alert generated: "Transaction from unfamiliar location"

**Scenario 4: Multiple Anomalies**
- Large amount + unusual location + odd time
- Risk Score: 85-95 (Very High)
- Multiple alerts, marked as FRAUD

## Troubleshooting

### Models Not Found
```bash
cd backend
python -m app.models.train_models
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart
```

### Frontend Not Connecting
- Check backend is running on port 8000
- Verify CORS settings in `backend/app/main.py`
- Check browser console for errors

### WebSocket Not Working
- WebSocket uses polling fallback (updates every 5 seconds)
- Check browser console for connection errors
- Verify backend WebSocket endpoint at `/ws`

## Presentation Tips

1. **Start with the Problem**: Explain why real-time fraud detection matters
2. **Show the Solution**: Live demo of the dashboard
3. **Explain the Tech**: Mention how it aligns with production banking systems
4. **Highlight Innovation**: Behavioral analytics, multi-model approach
5. **End with Impact**: Reduced false positives, faster detection, better UX

## Time Management

- **Setup**: 2-3 minutes
- **Demo**: 5-7 minutes
- **Q&A**: 2-3 minutes
- **Total**: ~10-15 minutes

