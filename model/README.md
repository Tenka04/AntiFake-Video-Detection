# Model Service

This directory contains the machine learning components for the AI Video Detector project. It runs as a standalone gRPC service that receives video processing requests from the backend.

## Structure
- `proto/`: Contains the gRPC Protocol Buffers definitions.
- `server.py`: The main gRPC server script.
- `poc_runtime.py`: (Root level) the current ML pipeline proof-of-concept.

## Local Development

The global `requirements.txt` in the root directory contains the dependencies for this service.

```bash
# Run the gRPC server locally (from the project root)
python -m model.server
```

## Docker

This service is containerized. To build and run it individually:
```bash
docker build -t aivideo-model .
docker run -p 50051:50051 aivideo-model
```
