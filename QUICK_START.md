# Quick Start Guide - Step by Step Setup

## Prerequisites

Before starting, ensure you have:
- **Docker Desktop** installed and running (recommended)
  - OR **Python 3.11+**, **Node.js 18+**, **PostgreSQL**, and **Redis** installed separately
- **Git** (if cloning from repository)
- **Terminal/Command Prompt** access

---

## Option 1: Using Docker (Recommended - Easiest)

### Step 1: Verify Docker is Running

```bash
# Check Docker is running
docker --version
docker-compose --version
```

If not installed, download from: https://www.docker.com/products/docker-desktop

### Step 2: Navigate to Project Directory

```bash
cd "C:\Users\ameic\Desktop\Real-Time Fraud Detection System"
```

### Step 3: Start All Services

```bash
docker-compose up
```

This will:
- Start PostgreSQL database
- Start Redis cache
- Build and start backend API
- Build and start frontend dashboard

**Wait for all services to start** (you'll see "Application startup complete" messages)

### Step 4: Train ML Models (First Time Only)

Open a **NEW terminal window** (keep docker-compose running in the first one):

```bash
cd "C:\Users\ameic\Desktop\Real-Time Fraud Detection System"
docker-compose exec backend python -m app.models.train_models
```

This will:
- Generate 10,000 synthetic transactions
- Train Isolation Forest model
- Train XGBoost model
- Save models to `backend/app/models/ml_models/`

**Expected output:**
```
Training Isolation Forest...
Isolation Forest trained successfully
Training XGBoost...
XGBoost trained successfully
Models saved to app/models/ml_models/
```

### Step 5: Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 6: Test the System

1. Open http://localhost:5173 in your browser
2. Click **"Start Auto Simulation"** in the Transaction Simulator panel
3. Watch transactions appear in real-time
4. Check the **Fraud Alerts** tab for any detected fraud

---

## Option 2: Manual Setup (Without Docker)

### Step 1: Install Prerequisites

#### Install Python 3.11+
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"

#### Install Node.js 18+
- Download from: https://nodejs.org/
- Choose LTS version

#### Install PostgreSQL
- Download from: https://www.postgresql.org/download/windows/
- Remember the password you set (default: `postgres`)

#### Install Redis
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

### Step 2: Set Up Backend

#### 2.1 Navigate to Backend Directory

```bash
cd "C:\Users\ameic\Desktop\Real-Time Fraud Detection System\backend"
```

#### 2.2 Create Virtual Environment

```bash
python -m venv venv
```

#### 2.3 Activate Virtual Environment

**Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

#### 2.4 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2.5 Create Environment File

Create a file named `.env` in the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fraud_detection
REDIS_URL=redis://localhost:6379
```

**Note:** Change `postgres:postgres` to your PostgreSQL username:password if different.

#### 2.6 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fraud_detection;

# Exit psql
\q
```

#### 2.7 Train ML Models

```bash
python -m app.models.train_models
```

Wait for models to train (takes 1-2 minutes).

#### 2.8 Start Backend Server

```bash
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Keep this terminal open!**

### Step 3: Set Up Frontend

#### 3.1 Open a NEW Terminal Window

Navigate to frontend directory:

```bash
cd "C:\Users\ameic\Desktop\Real-Time Fraud Detection System\frontend"
```

#### 3.2 Install Node Dependencies

```bash
npm install
```

This may take 2-3 minutes.

#### 3.3 Create Environment File (Optional)

Create a file named `.env` in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

#### 3.4 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 5: Test the System

1. Open http://localhost:5173 in your browser
2. Click **"Start Auto Simulation"** in the Transaction Simulator panel
3. Watch transactions appear in real-time
4. Check the **Fraud Alerts** tab for any detected fraud

---

## Verification Checklist

✅ **Backend is running:**
- Visit http://localhost:8000/health
- Should return: `{"status":"healthy","service":"fraud-detection-api"}`

✅ **Frontend is running:**
- Visit http://localhost:5173
- Should see the dashboard interface

✅ **ML Models are trained:**
- Check `backend/app/models/ml_models/` directory
- Should contain: `isolation_forest.pkl`, `xgboost_model.pkl`, `feature_scaler.pkl`

✅ **Database is connected:**
- Backend logs should show no database connection errors
- Tables are created automatically on first run

✅ **Redis is connected:**
- Backend logs should show no Redis connection errors

---

## Common Issues & Solutions

### Issue: "Port already in use"

**Solution:**
- Stop other services using ports 8000, 5173, 5432, or 6379
- Or change ports in `docker-compose.yml`

### Issue: "Models not found"

**Solution:**
```bash
# With Docker
docker-compose exec backend python -m app.models.train_models

# Without Docker
cd backend
python -m app.models.train_models
```

### Issue: "Database connection failed"

**Solution:**
- Check PostgreSQL is running: `docker-compose ps` (Docker) or check Windows Services
- Verify credentials in `.env` file match your PostgreSQL setup
- Ensure database `fraud_detection` exists

### Issue: "Redis connection failed"

**Solution:**
- Check Redis is running: `docker-compose ps` (Docker) or check Redis service
- Verify Redis URL in `.env` file

### Issue: "CORS errors in browser"

**Solution:**
- Ensure backend is running on port 8000
- Check `backend/app/main.py` has correct CORS origins
- Clear browser cache

### Issue: "WebSocket connection failed"

**Solution:**
- WebSocket uses polling fallback (updates every 5 seconds)
- Check browser console for specific errors
- Verify backend WebSocket endpoint at `/ws`

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Python dependencies fail to install"

**Solution:**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v
```

---

## Stopping the Application

### With Docker:
```bash
# Press Ctrl+C in the terminal running docker-compose
# Or in a new terminal:
docker-compose down
```

### Without Docker:
- Press `Ctrl+C` in both backend and frontend terminal windows
- Stop PostgreSQL and Redis services if running separately

---

## Next Steps

1. **Explore the Dashboard:**
   - Try the transaction simulator
   - View fraud alerts
   - Check analytics charts

2. **Read the Documentation:**
   - `DEMO_GUIDE.md` - For presentation tips
   - `PROJECT_SUMMARY.md` - For technical details

3. **Customize:**
   - Modify ML models in `backend/app/models/train_models.py`
   - Adjust fraud detection rules in `backend/app/services/fraud_detector.py`
   - Customize UI in `frontend/src/components/`

---

## Getting Help

If you encounter issues:
1. Check the error messages in terminal/console
2. Verify all prerequisites are installed
3. Check the verification checklist above
4. Review `SETUP.md` for more detailed information

