from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
from contextlib import asynccontextmanager

from app.api import transactions, fraud_alerts
from app.database.database import engine, Base
from app.services.redis_client import redis_client
from app.services.websocket_manager import manager

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    await redis_client.connect()
    yield
    # Shutdown
    await redis_client.disconnect()

app = FastAPI(
    title="Real-Time Fraud Detection API",
    description="API for real-time transaction fraud detection using ML",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://real-time-fraud-detection-system-p9pvtab5m.vercel.app",
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router, prefix="/api", tags=["transactions"])
app.include_router(fraud_alerts.router, prefix="/api", tags=["fraud-alerts"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send welcome message
        await websocket.send_json({"type": "connection", "message": "Connected to fraud detection system"})
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            try:
                parsed = json.loads(data)
                # Handle client messages here if needed
            except:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Real-Time Fraud Detection API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fraud-detection-api"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

