# AI Video Detector POC

## Current development phase

Phase 1 and Phase 2 are implemented. The existing React frontend has been
preserved unchanged. A new backend package now provides safe, reusable video
inspection and uniform RGB frame sampling; no API endpoint or detector model
has been added yet.

### Implemented preprocessing

- Validates and opens locally supplied videos through OpenCV.
- Extracts FPS, dimensions, frame count, estimated duration, codec, and
  best-effort audio-stream availability. Audio is reported as unavailable
  (`None`) when `ffprobe` is not installed rather than guessed.
- Samples up to 16 unique, uniformly distributed frames by default, resized to
  224x224 RGB. Short clips return their available unique frames.
- Raises a controlled `VideoProcessingError` for missing, corrupted, or
  non-decodable videos.

The preprocessing API lives in `backend/app/preprocessing/` and is covered by
`backend/tests/test_preprocessing.py`. Run it with:

```powershell
Set-Location backend
..\venv\Scripts\python.exe -m unittest discover -s tests -v
```

### Not implemented yet

- FastAPI routes and upload handling (Phase 4)
- VideoMAE model inference (Phase 3)
- temporal, frequency, audio, fusion, training, and evaluation branches

The root requirements now declare FastAPI and Uvicorn for the upcoming API
phase. They must be installed before starting that API.

This repository contains a small proof-of-concept for analyzing whether a video looks AI-generated or manipulated. The current implementation is a single Python script, [`poc_runtime.py`](/E:/AI%20video%20Detector/poc_runtime.py), backed by a local virtual environment in `venv/`.

## What this project does

The prototype currently uses one active model check and keeps a temporal
diagnostic implementation for later calibration:

- `VisualDetector`: samples 15 frames across the video and sends them through the Hugging Face model `dima806/ai_vs_real_image_detection`.
- `TemporalDetector`: measures frame-to-frame consistency using grayscale mean squared error, but is **not used in the verdict** because it has not been calibrated as a probability model.

The verdict is based only on the trained image-classification model's aggregate
frame score. A scene cut or motion heuristic cannot override that score.

## What is in the repository

- [`poc_runtime.py`](/E:/AI%20video%20Detector/poc_runtime.py): the full command-line proof of concept.
- [`video_path`](/E:/AI%20video%20Detector/video_path): local sample input videos used for testing.
- [`venv`](/E:/AI%20video%20Detector/venv): the local Python 3.11.9 virtual environment for this project.
- [`.gitignore`](/E:/AI%20video%20Detector/.gitignore): ignores the local environment, logs, and video assets.
- [`.gitattributes`](/E:/AI%20video%20Detector/.gitattributes): normalizes line endings and treats media files as binary.

## How the script works

When you run the script, it follows this flow:

1. Load the Hugging Face image classification pipeline.
2. Open the target video with OpenCV.
3. Sample frames for visual classification.
4. Aggregate the trained visual-model scores into one overall AI probability.
6. Print a terminal report with:
   - verdict
   - overall AI score
   - overall confidence
   - per-detector reasoning

## Verdict thresholds

The final score is interpreted like this:

- `>= 0.75`: likely AI-generated or manipulated
- `<= 0.35`: likely authentic
- between those values: inconclusive, manual review recommended

These are heuristic thresholds, not scientifically validated guarantees.

## Virtual environment analysis

The local environment was created with:

- Python version: `3.11.9`
- environment path: [`venv`](/E:/AI%20video%20Detector/venv)
- base interpreter: `D:\Programs\Python\python.exe`

The installed packages show that the environment is prepared for computer vision and ML experimentation. The most important packages are:

- `transformers 5.14.1`: loads the Hugging Face classifier
- `huggingface_hub 1.24.0`: fetches model assets
- `torch 2.13.0`: supports model inference
- `torchvision 0.28.0`: image utilities for PyTorch workflows
- `opencv-python 5.0.0.93`: video loading and frame extraction
- `pillow 12.3.0`: converts frames to PIL images
- `numpy 2.4.6`: numeric processing for frame-difference heuristics

Other notable packages:

- `tensorflow 2.21.0`, `keras 3.15.0`, and `tf_keras 2.21.0` are installed, but they are not currently used by `poc_runtime.py`.
- `httpx`, `requests`, `rich`, and `typer` are present as supporting ecosystem dependencies.

In short, the venv is heavier than the current script strictly needs. Right now the active runtime depends mainly on OpenCV, Pillow, NumPy, Transformers, Hugging Face Hub, and PyTorch.

## How to run it

PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
python .\poc_runtime.py ".\video_path\cat.mp4"
```

Without activating the environment:

```powershell
.\venv\Scripts\python.exe .\poc_runtime.py ".\video_path\cat.mp4"
```

You can replace `cat.mp4` with any of the current sample videos:

- `video_path\5 Star.mp4`
- `video_path\cat.mp4`
- `video_path\man.mp4`
- `video_path\SB-Jain.mp4`

## Expected output

The script prints a console report similar to:

- `Verdict`
- `Overall AI Score`
- `Overall Confidence`
- `Evidence Breakdown` for visual and temporal detectors

The complete Hugging Face checkpoint must be available locally. The POC does
not silently download or substitute a model during analysis; it reports an
explicit unavailable-model error instead.

## Current limitations

- Audio detection is only a mock placeholder.
- Metadata detection is only a mock placeholder.
- The visual model is an image detector, not a video-native detector.
- The temporal detector is an uncalibrated heuristic and is intentionally not
  used in the verdict.
- There is no batch mode, web UI, API, persistence layer, or saved report format yet.
- The script prints results to stdout only.

## Who this README is for

If someone opens this project for the first time, the most important thing to know is:

- this is an experimental prototype, not a production detector
- the only executable workflow today is the CLI script in [`poc_runtime.py`](/E:/AI%20video%20Detector/poc_runtime.py)
- the `venv` already contains the main packages needed to run that script locally

## Recommended next improvements

- add a `requirements.txt` or `pyproject.toml`
- log structured JSON output in addition to console text
- separate detectors into individual modules
- add unit tests for scoring and fusion logic
- document expected hardware and model download size
- replace mock detectors with real audio and metadata analysis
