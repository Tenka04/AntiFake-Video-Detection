# AntiFake: ZeroGPT-Style AI Video & Deepfake Detector

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![gRPC](https://img.shields.io/badge/gRPC-Microservices-244c5a?style=flat&logo=grpc&logoColor=white)](https://grpc.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, multi-signal AI video authenticity and deepfake detection platform. Built to detect modern high-fidelity generative video models (**OpenAI Sora, Kuaishou Kling, MiniMax Hailuo, Runway Gen-2/3, Luma Dream Machine, Pika, Seedance**) and facial deepfakes by fusing low-level physical forensics with deep learning semantics.

Inspired by ZeroGPT's intuitive interface, AntiFake features an interactive SVG radial gauge, frame-by-frame forensic breakdowns, inter-frame motion vector analysis, and persistent audit histories.

---

## Key Features

- **7-Detector Forensic Ensemble**:
  - **CLIP ViT-B/32 Zero-Shot Semantics**: Captures subtle prompt-driven visual artifacts, plastic skin texturing, and lighting inconsistencies.
  - **Dense Optical Flow (Farneback)**: Tracks pixel trajectory vectors across frames to expose unnatural motion smoothness, generative morphing, and frame jitter.
  - **PRNU Sensor Noise Residuals**: Analyzes Photo-Response Non-Uniformity (sensor noise variance) to detect the absence of real physical camera CMOS sensors.
  - **Temporal Frame Consistency**: Measures consecutive frame Mean Squared Error (MSE) variance to identify synthetic frame transitions and temporal flickering.
  - **2D FFT Spectral Artifacts**: Discovers high-frequency energy anomalies in the frequency domain caused by generative model upsampling.
  - **Compression Forensics**: Vectorized 8x8 DCT macroblock boundary analysis to separate authentic camera codec compression from raw generated pixels.
  - **VideoMAE Spatio-Temporal Transformer**: Transformer-based sequence feature inspection.
- **Non-Linear Forensic Overrule (`FusionEngine`)**:
  - Automatically suppresses semantic false negatives: when low-level physical forensic detectors (noise, flow, temporal consistency) identify synthetic behavior, they overrule visual models that may be fooled by photorealism.
- **Modern ZeroGPT-Style Dashboard**:
  - Dynamic SVG Circular Gauge with animated counters and color-coded verdicts.
  - Upload zone supporting MP4, WebM, MOV, and AVI up to 100MB.
  - Interactive multi-signal radar and individual forensic cards displaying raw scores, confidence levels, and technical explanations.
  - Scan history with SQLite persistence.
- **Production Monorepo Architecture**:
  - Decoupled Frontend (Vite/React), API Gateway (FastAPI), and Inference Engine (gRPC).

---

## System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       Client Browser (Vite/React)       │
                  │  Port 5173  •  TailwindCSS  •  SPA     │
                  └───────────────────┬────────────────────┘
                                      │ REST / multipart
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          FastAPI Gateway               │
                  │  Port 8000  •  SQLite History DB       │
                  └───────────────────┬────────────────────┘
                                      │ gRPC (Protobuf)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         ML Inference Engine            │
                  │  Port 50051  •  PyTorch & OpenCV        │
                  │                                        │
                  │  ┌──────────────────────────────────┐  │
                  │  │     7-Model Forensic Ensemble    │  │
                  │  │  • CLIP Zero-Shot (ViT-B/32)     │  │
                  │  │  • Dense Optical Flow            │  │
                  │  │  • PRNU Sensor Noise Residuals   │  │
                  │  │  • Temporal Frame Consistency    │  │
                  │  │  • 2D FFT Spectral Analysis      │  │
                  │  │  • DCT Block Compression Codec   │  │
                  │  │  • VideoMAE Transformer          │  │
                  │  └──────────────────┬───────────────┘  │
                  │                     │                  │
                  │                     ▼                  │
                  │        Non-Linear FusionEngine         │
                  └────────────────────────────────────────┘
```

---

## Directory Structure

```
.
├── backend/                  # FastAPI Application & API Gateway
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint, CORS, routes
│   │   ├── database.py       # SQLite database configuration & session
│   │   ├── models_db.py      # SQLAlchemy models for scan history
│   │   ├── schemas.py        # Pydantic schemas for requests & responses
│   │   ├── grpc_client.py    # gRPC client communicating with ML service
│   │   └── config.py         # Application settings & environment variables
│   ├── Dockerfile            # Container definition for backend service
│   └── README.md             # Backend-specific instructions
├── frontend/                 # Vite + React User Interface
│   ├── src/
│   │   ├── components/       # Gauge, UploadZone, DetectorBreakdown, History
│   │   ├── App.tsx           # Main application state and layout
│   │   └── index.css         # Styling and design system tokens
│   ├── package.json          # Node dependencies & scripts
│   ├── Dockerfile            # Container definition for frontend service
│   └── README.md             # Frontend-specific instructions
├── model/                    # ML Model Inference Server
│   ├── proto/
│   │   ├── detector.proto    # Protocol Buffer definitions
│   │   ├── detector_pb2.py   # Generated Protobuf Python bindings
│   │   └── detector_pb2_grpc.py
│   ├── server.py             # gRPC server implementing DetectorService
│   ├── Dockerfile            # Container definition for ML engine
│   └── README.md             # Model-specific instructions
├── poc_runtime.py            # Standalone ML engine & CLI execution script
├── docker-compose.yml        # Multi-container local orchestration
├── requirements.txt          # Python dependencies (PyTorch, OpenCV, Transformers, etc.)
└── README.md                 # Project root documentation
```

---

## Getting Started Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **FFmpeg** (installed and added to system `PATH`)
- *(Optional)* NVIDIA GPU with CUDA support for accelerated inference

---

### Option 1: Native 3-Terminal Run (Recommended for Development)

#### 1. Setup Python Virtual Environment
In the repository root:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Terminal 1: Start the ML Model Server (gRPC)
```bash
# Ensure venv is active
python -m model.server
```
*Listens on `0.0.0.0:50051`.*

#### 3. Terminal 2: Start the FastAPI Backend
```bash
# Ensure venv is active
python -m uvicorn backend.app.main:app --port 8000 --reload
```
*Swagger documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).*

#### 4. Terminal 3: Start the Vite Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend interface available at [http://localhost:5173](http://localhost:5173).*

---

### Option 2: Standalone CLI Analysis (No Microservices Required)

To inspect a single video directly from your terminal using the full 7-detector ensemble without running the web stack:

```bash
python poc_runtime.py "path/to/video.mp4"
```

Example output:
```text
=== Starting AI Video Authenticity Analysis (V1) ===
Target: video_path/sample.mp4

  [Visual/CLIP] Analyzing frames with CLIP zero-shot classification...
  [OpticalFlow] Computing dense optical flow...
  [Compression] Analyzing compression artifacts...
  [Frequency] Analyzing spectral artifacts...
  [Noise] Extracting noise residuals...
  [Temporal] Analyzing inter-frame consistency and motion...

=============================================
                REPORT
=============================================
Verdict:              LIKELY AI-GENERATED / MANIPULATED
Overall AI Score:     88.42%
Overall Confidence:   84.60%

Evidence Breakdown:
  [TEMPORAL] - Weight: 35%
    AI Score:   85.0% (Conf: 80.0%)
    Reasoning:  Analyzed 60 sequential frames. Unnatural temporal flickering/morphing detected.
  [NOISE] - Weight: 25%
    AI Score:   95.0% (Conf: 90.0%)
    Reasoning:  Analyzed 5 frames. Missing natural PRNU sensor noise.
  [OPTICALFLOW] - Weight: 15%
    AI Score:   80.0% (Conf: 70.0%)
    Reasoning:  Unnatural motion patterns (AI-like morphing).
  [FREQUENCY] - Weight: 15%
    AI Score:   85.0% (Conf: 80.0%)
    Reasoning:  Unnaturally smooth high frequencies (Likely AI upsampling).
  [COMPRESSION] - Weight: 5%
    AI Score:   45.0% (Conf: 50.0%)
  [CLIP] - Weight: 5%
    AI Score:   52.1% (Conf: 78.4%)
=============================================
```

---

### Option 3: Docker Compose

Spin up all three microservices with a single command:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
- Model Server: `localhost:50051`

---

## API Reference

### 1. Analyze Video
- **Endpoint**: `POST /api/analyze`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (Video binary: MP4, WebM, MOV, AVI)
- **Response**:
```json
{
  "id": 1,
  "filename": "sample.mp4",
  "ai_score": 0.8842,
  "confidence": 0.846,
  "verdict": "LIKELY AI-GENERATED / MANIPULATED",
  "summary": "Analyzed sequential frames. Unnatural temporal flickering/morphing detected.",
  "detectors": {
    "temporal": { "score": 0.85, "confidence": 0.80, "details": { "reason": "...", "model": "..." } },
    "noise": { "score": 0.95, "confidence": 0.90, "details": { "reason": "...", "model": "..." } },
    "opticalflow": { "score": 0.80, "confidence": 0.70, "details": { "reason": "...", "model": "..." } },
    "frequency": { "score": 0.85, "confidence": 0.80, "details": { "reason": "...", "model": "..." } },
    "clip": { "score": 0.521, "confidence": 0.784, "details": { "reason": "...", "model": "..." } },
    "compression": { "score": 0.45, "confidence": 0.50, "details": { "reason": "...", "model": "..." } }
  },
  "created_at": "2026-09-15T16:00:00.000Z"
}
```

### 2. Scan History
- **Endpoint**: `GET /api/history`
- **Response**: List of previous scan summaries and forensic verdicts.

### 3. Health Check
- **Endpoint**: `GET /health`
- **Response**: `{"status": "ok", "grpc_connected": true}`

---

## Production Deployment ($0/Month Free Tier Guide)

Running video AI models for free can be challenging due to high memory requirements (PyTorch + OpenCV + Transformers require ~4GB+ RAM). You can host this entire stack at **$0/month** by using the following architecture:

| Tier | Component | Free Provider | Specs |
|---|---|---|---|
| **Frontend** | React / Vite SPA | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Unlimited CDN, instant deployment |
| **Backend** | FastAPI Gateway | [Render](https://render.com) (Web Service) | 512MB RAM, public HTTPS API |
| **Inference** | gRPC Model Server | [Hugging Face Spaces](https://huggingface.co/spaces) | **16GB RAM, 2 vCPUs** (Free Docker Space) |

### Deployment Steps:
1. **Frontend on Vercel**:
   - Connect your GitHub repository, choose the `frontend` directory as the root.
   - Configure Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`.
2. **Backend on Render**:
   - Create a Web Service from the repo with root directory `backend`.
   - Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 10000`.
   - Configure Environment Variable: `MODEL_SERVICE_HOST=your-hf-space.hf.space:443`.
3. **ML Server on Hugging Face Spaces**:
   - Create a new **Docker Space** on Hugging Face.
   - Upload `model/`, `poc_runtime.py`, and `requirements.txt`.
   - Hugging Face automatically provisions 16GB RAM for free to run PyTorch and OpenCV without out-of-memory crashes.

---

## Security & Privacy

- Videos uploaded for analysis are processed in transient memory or temporary storage and can be configured to auto-purge after inference.
- No client biometric data or video embeddings are retained or sold.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
