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
        "summary": result.get("summary") if not "error" in result else None,
        "detectors": result.get("detectors") if not "error" in result else None,
        "timestamp": date_str
    }

@app.post("/api/analyze-video-url")
async def analyze_video_url_endpoint(request: VideoUrlRequest):
    """
    Endpoint for submitting a video URL.
    """
    job_id = str(uuid.uuid4())
    start_time = time.time()
    date_str = datetime.utcnow().isoformat() + "Z"
    
    # Extract filename from URL or use default
    filename = "url_video.mp4"
        
    real_path = os.path.join(UPLOAD_DIR, f"{job_id}_{filename}")
    
    try:
        # Use yt-dlp to download video from any platform (YouTube, Instagram, TikTok, direct URLs, etc.)
        import subprocess
        import sys
        
        # Find yt-dlp next to the running python executable
        yt_dlp_path = os.path.join(os.path.dirname(sys.executable), "yt-dlp.exe")
        print(f"[URL] Downloading video from: {request.url}")
        print(f"[URL] yt-dlp path: {yt_dlp_path} (exists: {os.path.exists(yt_dlp_path)})")
        print(f"[URL] Output path: {real_path}")
        
        result_dl = subprocess.run(
            [
                yt_dlp_path,
                "--no-playlist",
                "-f", "134/135/136/133/160",
                "-o", real_path,
                request.url
            ],
            capture_output=True, text=True, timeout=120
        )
        
        print(f"[URL] yt-dlp return code: {result_dl.returncode}")
        print(f"[URL] yt-dlp stdout: {result_dl.stdout[:500]}")
        if result_dl.stderr:
            print(f"[URL] yt-dlp stderr: {result_dl.stderr[:500]}")
        
        if result_dl.returncode != 0:
            raise Exception(f"yt-dlp error: {result_dl.stderr[:200]}")
        
        if not os.path.exists(real_path):
            # yt-dlp may add an extension, find the actual file
            import glob
            matches = glob.glob(os.path.join(UPLOAD_DIR, f"{job_id}_*"))
            print(f"[URL] File not at expected path, searching... Found: {matches}")
            if matches:
                real_path = matches[0]
            else:
                raise Exception("Download completed but file not found")
                
        print(f"[URL] Downloaded successfully to: {real_path} (size: {os.path.getsize(real_path)} bytes)")
        
    except Exception as e:
        print(f"[URL] Download FAILED: {e}")
        return {
            "id": job_id,
            "status": "failed",
            "ai_probability": 0.0,
            "human_probability": 0.0,
            "confidence": 0.0,
            "processing_time": 0.0,
            "model_info": f"Download failed: {str(e)}",
            "timestamp": date_str
        }

    database.add_history(job_id, request.url, date_str, status='processing')
    
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
        "summary": result.get("summary") if not "error" in result else None,
        "detectors": result.get("detectors") if not "error" in result else None,
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
