# AI Video Detector

This project is a modular, production-ready AI video authenticity platform. 
It analyzes videos to estimate whether the content is AI-generated, manipulated, or likely authentic.

## Monorepo Structure

This project is structured as a monorepo to allow independent development for a 3-person team:

- `frontend/`: The web application (Vite + React). Maintained by the Frontend Engineer.
- `backend/`: The API and orchestration layer (FastAPI). Maintained by the Backend Engineer.
- `model/`: The gRPC service for ML inference. Maintained by the ML Engineer.

## Running Locally (Docker Compose)

The easiest way to spin up the entire stack is to use Docker Compose from the root directory:

```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:5173
- Backend API on http://localhost:8000
- Model gRPC service on port 50051

## Global Requirements

The `requirements.txt` at the root directory contains the Python dependencies needed for both the `backend` and `model` services. This ensures a unified environment for Python developers if they prefer to use a single virtual environment (`venv`) locally.

The main execution script `poc_runtime.py` remains at the root level for quick testing of the ML pipeline without standing up the microservices.

## Development Workflows

### Frontend Developer
Navigate to `frontend/` and read `frontend/README.md`. Use Node and NPM to run the Vite server locally.

### Backend Developer
Navigate to `backend/` and read `backend/README.md`. Use `uvicorn` to run the FastAPI app locally. The backend communicates with the model service via gRPC.

### ML Engineer
Navigate to `model/` and read `model/README.md`. Modify the PyTorch models and the gRPC server (`model/server.py`). Update the protobuf definitions in `model/proto/` as needed.
