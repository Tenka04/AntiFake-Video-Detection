"""
HTTP wrapper around the ML inference engine for production deployment.

Hugging Face Spaces only expose port 7860 over HTTP, but the existing
model/server.py uses gRPC on port 50051. This HTTP server wraps the same
analyze_video() function from poc_runtime.py behind a FastAPI endpoint
that accepts video file uploads.

Usage (local):
    python -m model.http_server

Usage (HF Spaces Dockerfile CMD):
    CMD ["python", "-m", "model.http_server"]
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import os
import sys
import logging

# Add root directory to sys.path so we can import poc_runtime
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from poc_runtime import analyze_video

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="AntiFake ML Inference Server",
    description="HTTP wrapper for the 7-detector forensic ensemble.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    job_id: str = Form("unknown"),
):
    """
    Accept a video file upload, run the full 7-detector forensic ensemble,
    and return structured results.
    """
    suffix = os.path.splitext(file.filename or "video.mp4")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir="/tmp") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        logging.info(
            f"[HTTP] Analyzing {file.filename} (job: {job_id}, "
            f"size: {len(content)} bytes) at {tmp_path}"
        )
        results = analyze_video(tmp_path)
        logging.info(f"[HTTP] Analysis complete for job {job_id}")
        return results
    except Exception as e:
        logging.error(f"[HTTP] Analysis failed for job {job_id}: {e}")
        return {
            "score": 0.0,
            "confidence": 0.0,
            "summary": f"Analysis failed: {str(e)}",
            "detectors": {},
        }
    finally:
        # Always clean up the temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/health")
async def health():
    """Health check — used by monitoring and by the backend to verify connectivity."""
    return {"status": "ok", "service": "ml-inference"}


@app.get("/")
async def root():
    """Root endpoint — HF Spaces shows this as the default page."""
    return {
        "service": "AntiFake ML Inference Server",
        "status": "running",
        "endpoints": {
            "POST /analyze": "Upload a video file for forensic analysis",
            "GET /health": "Health check",
        },
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7860"))
    logging.info(f"Starting HTTP inference server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
