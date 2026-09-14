import grpc
from concurrent import futures
import time
import logging

# Note: In a real environment, you need to compile the proto file first using grpc_tools.protoc.
# For example: python -m grpc_tools.protoc -I./model/proto --python_out=./model/proto --grpc_python_out=./model/proto ./model/proto/video_detector.proto
import sys
import os
# Add the proto directory to the sys.path temporarily to resolve imports if compiled in-place
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'proto')))

try:
    import video_detector_pb2
    import video_detector_pb2_grpc
except ImportError:
    logging.warning("gRPC proto files not found. Please compile them using grpc_tools.protoc.")
    # Mocking for skeleton to not crash immediately if proto not compiled yet
    class MockPb2Grpc:
        class VideoDetectorServiceServicer:
            pass
        def add_VideoDetectorServiceServicer_to_server(self, servicer, server):
            pass
    video_detector_pb2_grpc = MockPb2Grpc()
    class MockPb2:
        class AnalyzeResponse:
            def __init__(self, **kwargs):
                self.__dict__.update(kwargs)
    video_detector_pb2 = MockPb2()

class VideoDetectorServicer(video_detector_pb2_grpc.VideoDetectorServiceServicer):
    def AnalyzeVideo(self, request, context):
        logging.info(f"Received AnalyzeVideo request for job {request.job_id} on video {request.video_path}")
        
        # Here we would integrate with the actual model logic from poc_runtime.py
        # For now, return a mock response
        
        time.sleep(2) # simulate processing time
        
        return video_detector_pb2.AnalyzeResponse(
            job_id=request.job_id,
            ai_probability=0.85,
            confidence=0.92,
            summary="High probability of AI generation detected due to temporal inconsistencies."
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    video_detector_pb2_grpc.add_VideoDetectorServiceServicer_to_server(VideoDetectorServicer(), server)
    server.add_insecure_port('[::]:50051')
    logging.info("Starting gRPC server on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    serve()
