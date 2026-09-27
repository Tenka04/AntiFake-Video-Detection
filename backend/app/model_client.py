import logging
import os
import sys

# Ensure the proto models are available for local gRPC development
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../model/proto')))

try:
    import grpc
    import video_detector_pb2
    import video_detector_pb2_grpc
except ImportError:
    logging.warning("gRPC proto files not found. gRPC mode unavailable.")
    grpc = None
    video_detector_pb2, video_detector_pb2_grpc = None, None


def analyze_video(video_path: str, job_id: str):
    """
    Route analysis to the ML inference server.

    - Production (MODEL_SERVICE_HOST starts with http): Uses gradio_client
      to call the HF Spaces Gradio app, which is free-tier compatible.
    - Local development: Uses gRPC on the raw host:port.
    """
    host = os.environ.get('MODEL_SERVICE_HOST', 'localhost:50051')

    # ── Gradio / HTTP mode (production — Hugging Face Spaces) ─────────
    if host.startswith("http"):
        return _analyze_via_gradio(host, video_path, job_id)

    # ── gRPC mode (local development / Docker Compose) ────────────────
    return _analyze_via_grpc(host, video_path, job_id)


def _analyze_via_gradio(space_url: str, video_path: str, job_id: str):
    """
    Call the Gradio-based ML server on Hugging Face Spaces.

    The Gradio app exposes an API at /api/predict that accepts a video file
    and returns the forensic analysis results as JSON.
    """
    try:
        from gradio_client import Client, handle_file

        logging.info(f"[Gradio] Connecting to HF Space: {space_url}")
        client = Client(space_url)

        # Gradio's predict() uploads the file and calls the process_video function
        result = client.predict(
            video=handle_file(video_path),
            api_name="/predict",
        )

        # result is already a dict (Gradio JSON output)
        if isinstance(result, dict):
            return result
        elif isinstance(result, str):
            import json
            return json.loads(result)
        else:
            return {"error": f"Unexpected response type: {type(result)}"}

    except ImportError:
        logging.error("gradio_client not installed. Run: pip install gradio_client")
        return {"error": "gradio_client library not installed"}
    except Exception as e:
        logging.error(f"Gradio client call failed: {e}")
        return {"error": str(e)}


def _analyze_via_grpc(host: str, video_path: str, job_id: str):
    """Call the gRPC-based ML server (local development / Docker Compose)."""
    if not video_detector_pb2 or not grpc:
        return {"error": "gRPC proto files not found"}

    channel = grpc.insecure_channel(host)
    stub = video_detector_pb2_grpc.VideoDetectorServiceStub(channel)

    try:
        response = stub.AnalyzeVideo(video_detector_pb2.AnalyzeRequest(
            video_path=video_path,
            job_id=job_id
        ))
        return {
            "job_id": response.job_id,
            "ai_probability": response.ai_probability,
            "confidence": response.confidence,
            "summary": response.summary,
            "detectors": [
                {
                    "name": d.name,
                    "ai_score": d.ai_score,
                    "confidence": d.confidence,
                    "reason": d.reason
                } for d in response.detectors
            ]
        }
    except grpc.RpcError as e:
        logging.error(f"gRPC call failed: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(analyze_video("/path/to/test.mp4", "job_123"))
