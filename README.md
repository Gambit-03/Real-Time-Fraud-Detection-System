# Real-Time Fraud Detection System

A machine learning-based fraud detection system that analyzes transaction patterns in real-time using behavioral analytics and anomaly detection.

## 🚀 Quick Start

**For detailed step-by-step instructions, see [QUICK_START.md](QUICK_START.md)**

### Using Docker (Recommended - Easiest)

```bash
# 1. Start all services
docker-compose up

# 2. In a new terminal, train ML models (first time only)
docker-compose exec backend python -m app.models.train_models

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

### Manual Setup

See [QUICK_START.md](QUICK_START.md) for complete manual setup instructions.

## Tech Stack

### Backend & ML
- Python 3.11+
- FastAPI - Modern async API framework
- Scikit-learn - Isolation Forest for anomaly detection
- XGBoost - Behavioral pattern classification
- Redis - Real-time data storage and caching
- PostgreSQL - Transaction history and audit logs

### Frontend
- React 18+ with TypeScript
- Vite - Fast build tool
- Recharts - Real-time visualizations
- Tailwind CSS - Modern UI styling
- WebSocket - Real-time updates

## Features

- **Real-Time Detection**: Instant analysis of transactions as they occur
- **Behavioral Analytics**: Learns individual user patterns to reduce false positives
- **Anomaly Detection**: Identifies both known and novel fraud patterns
- **Live Dashboard**: Real-time visualization of transactions and fraud alerts
- **Risk Scoring**: 0-100 risk score for each transaction

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Step-by-step setup guide ⭐ **START HERE**
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Demo presentation guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project documentation

## Project Structure

```
fraud-detection-system/
├── backend/           # FastAPI backend and ML models
├── frontend/          # React dashboard
├── docker-compose.yml # Container orchestration
└── README.md
```

