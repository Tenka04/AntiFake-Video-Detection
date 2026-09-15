import grpc
import logging

# Ensure the proto models are available here as well
# For simplicity, they should be generated from the same proto file
import sys
import os
# Assuming proto files are shared or copied here
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../model/proto')))

try:
    import video_detector_pb2
    import video_detector_pb2_grpc
except ImportError:
    logging.warning("gRPC proto files not found. Please compile them.")
    video_detector_pb2, video_detector_pb2_grpc = None, None

def analyze_video(video_path: str, job_id: str):
    if not video_detector_pb2:
        return {"error": "gRPC proto files not found"}
        
    # Connect to the gRPC server
    host = os.environ.get('MODEL_SERVICE_HOST', 'localhost:50051')
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
            "summary": response.summary
        }
    except grpc.RpcError as e:
        logging.error(f"gRPC call failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(analyze_video("/path/to/test.mp4", "job_123"))
