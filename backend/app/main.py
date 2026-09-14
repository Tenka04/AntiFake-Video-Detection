from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime
import time

from backend.app.model_client import analyze_video

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

@app.post("/api/analyze-video")
async def analyze_video_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for uploading a video file for analysis.
    In a real scenario, the file would be saved to disk/cloud storage and then passed to the model.
    """
    job_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Simulate saving file (we'll just use a dummy path for now since model is not fully integrated yet)
    # real_path = f"/tmp/{job_id}_{file.filename}"
    # with open(real_path, "wb") as f:
    #     f.write(await file.read())
    
    # Try calling the gRPC service, but provide a fallback if it fails or is unavailable
    result = analyze_video(f"dummy_path/{file.filename}", job_id)
    
    if "error" in result:
        # Fallback dummy response if gRPC is not available (e.g., proto not compiled)
        ai_prob = 0.85
        human_prob = 0.15
        conf = 0.92
        model_info = "v2.1-ensemble (mock)"
    else:
        ai_prob = result.get("ai_probability", 0.5)
        human_prob = 1.0 - ai_prob
        conf = result.get("confidence", 0.9)
        model_info = result.get("summary", "gRPC Model")

    processing_time = time.time() - start_time

    return {
        "id": job_id,
        "status": "completed",
        "ai_probability": ai_prob,
        "human_probability": human_prob,
        "confidence": conf,
        "processing_time": round(processing_time + 2.5, 1), # Add dummy time to simulate processing
        "model_info": model_info,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/api/analyze-video-url")
async def analyze_video_url_endpoint(request: VideoUrlRequest):
    """
    Endpoint for submitting a video URL.
    """
    job_id = str(uuid.uuid4())
    
    # Dummy response for URL
    return {
        "id": job_id,
        "status": "completed",
        "ai_probability": 0.12,
        "human_probability": 0.88,
        "confidence": 0.96,
        "processing_time": 1.8,
        "model_info": "v2.1-ensemble (url mock)",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/history")
async def get_history():
    """
    Returns historical analysis.
    """
    return [
        {
            "id": "mock_id_1",
            "filename": "suspicious_clip.mp4",
            "date": datetime.utcnow().isoformat() + "Z",
            "status": "completed",
            "result": "AI Generated",
            "confidence": 0.85
        },
        {
            "id": "mock_id_2",
            "filename": "interview.mov",
            "date": datetime.utcnow().isoformat() + "Z",
            "status": "completed",
            "result": "Likely Authentic",
            "confidence": 0.92
        }
    ]

@app.get("/api/stats")
async def get_stats():
    """
    Returns dashboard statistics.
    """
    return {
        "analyzed": 142,
        "aiDetected": 38,
        "authentic": 104,
        "pending": 2
    }
