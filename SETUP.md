# Setup Instructions

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Python 3.11+, Node.js 18+, PostgreSQL, Redis

## Quick Start with Docker

1. **Clone/Navigate to the project directory**

2. **Start all services:**
   ```bash
   docker-compose up
   ```

3. **Train ML models (first time only):**
   ```bash
   docker-compose exec backend python -m app.models.train_models
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fraud_detection
   REDIS_URL=redis://localhost:6379
   ```

3. **Start PostgreSQL and Redis:**
   ```bash
   docker-compose up postgres redis
   ```

4. **Train ML models:**
   ```bash
   python -m app.models.train_models
   ```

5. **Start the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Install Node dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment variables (optional):**
   ```bash
   # Create .env file
   VITE_API_URL=http://localhost:8000
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

## Verify Installation

1. Check backend health: http://localhost:8000/health
2. Check API docs: http://localhost:8000/docs
3. Open frontend: http://localhost:5173

## Troubleshooting

- **Port conflicts**: Change ports in docker-compose.yml
- **Database connection**: Ensure PostgreSQL is running
- **Models not found**: Run `python -m app.models.train_models`
- **CORS errors**: Check backend CORS settings in `app/main.py`

