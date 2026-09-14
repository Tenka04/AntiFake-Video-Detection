# Backend Service

This directory contains the FastAPI backend for the AI Video Detector project.

## Structure
- `app/`: Contains the FastAPI application logic.
- `app/model_client.py`: The gRPC client to communicate with the model service.
- `tests/`: Contains backend-specific unit and integration tests.

## Local Development

The global `requirements.txt` in the root directory contains the dependencies for this service.

```bash
# Run the FastAPI server locally (from the project root)
uvicorn backend.app.main:app --reload
```

## Docker

This service is containerized. To build and run it individually:
```bash
docker build -t aivideo-backend -f backend/Dockerfile .
docker run -p 8000:8000 aivideo-backend
```
