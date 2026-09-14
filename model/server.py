import grpc
from concurrent import futures
import time
import logging
import sys
import os

# Add the proto directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'proto')))
# Add root directory to sys.path to import poc_runtime
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import video_detector_pb2
import video_detector_pb2_grpc
from poc_runtime import analyze_video

class VideoDetectorServicer(video_detector_pb2_grpc.VideoDetectorServiceServicer):
    def AnalyzeVideo(self, request, context):
        logging.info(f"Received AnalyzeVideo request for job {request.job_id} on video {request.video_path}")
        
        try:
            results = analyze_video(request.video_path)
            return video_detector_pb2.AnalyzeResponse(
                job_id=request.job_id,
                ai_probability=results.get("score", 0.0),
                confidence=results.get("confidence", 0.0),
                summary=results.get("summary", "Analysis complete.")
            )
        except Exception as e:
            logging.error(f"Error during analysis: {e}")
            return video_detector_pb2.AnalyzeResponse(
                job_id=request.job_id,
                ai_probability=0.0,
                confidence=0.0,
                summary=f"Analysis failed: {str(e)}"
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
