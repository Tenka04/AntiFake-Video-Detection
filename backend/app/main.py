import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime
import time

from backend.app.model_client import analyze_video
from backend.app import database

# Initialize the database
database.init_db()

app = FastAPI(title="AI Video Detector API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoUrlRequest(BaseModel):
    url: str

# Ensure upload directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/analyze-video")
async def analyze_video_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for uploading a video file for analysis.
    """
    job_id = str(uuid.uuid4())
    start_time = time.time()
    date_str = datetime.utcnow().isoformat() + "Z"
    
    # Save file to disk
    real_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    with open(real_path, "wb") as f:
        f.write(await file.read())
        
    # Add to history as processing
    database.add_history(job_id, file.filename, date_str, status='processing')
    
    # Try calling the gRPC service
    result = analyze_video(real_path, job_id)
    
    if "error" in result:
        ai_prob = 0.85
        human_prob = 0.15
        conf = 0.92
        model_info = "v2.1-ensemble (mock)"
        status = 'failed'
        verdict = 'Needs Review'
    else:
        ai_prob = result.get("ai_probability", 0.5)
        human_prob = 1.0 - ai_prob
        conf = result.get("confidence", 0.9)
        model_info = result.get("summary", "gRPC Model")
        status = 'completed'
        
        # Determine verdict based on poc_runtime.py logic
        if ai_prob >= 0.75:
            verdict = "AI Generated"
        elif ai_prob <= 0.35:
            verdict = "Likely Authentic"
        else:
            verdict = "Needs Review"

    processing_time = time.time() - start_time
    
    # Update history in database
    database.update_history(job_id, status=status, result=verdict, confidence=conf)

    return {
        "id": job_id,
        "status": status,
        "ai_probability": ai_prob,
        "human_probability": human_prob,
        "confidence": conf,
        "processing_time": round(processing_time, 1),
        "model_info": model_info,
        "timestamp": date_str
    }

@app.post("/api/analyze-video-url")
async def analyze_video_url_endpoint(request: VideoUrlRequest):
    """
    Endpoint for submitting a video URL.
    """
    job_id = str(uuid.uuid4())
    date_str = datetime.utcnow().isoformat() + "Z"
    
    database.add_history(job_id, request.url, date_str, status='completed', result='Needs Review', confidence=0.0)
    
    # Dummy response for URL
    return {
        "id": job_id,
        "status": "completed",
        "ai_probability": 0.12,
        "human_probability": 0.88,
        "confidence": 0.96,
        "processing_time": 1.8,
        "model_info": "v2.1-ensemble (url mock)",
        "timestamp": date_str
    }

@app.get("/api/history")
async def get_history():
    """
    Returns historical analysis from the database.
    """
    return database.get_history()

@app.get("/api/stats")
async def get_stats():
    """
    Returns dashboard statistics from the database.
    """
    return database.get_stats()
