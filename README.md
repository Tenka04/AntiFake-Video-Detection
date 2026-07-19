# AI Video Detector POC

This repository contains a small proof-of-concept for analyzing whether a video looks AI-generated or manipulated. The current implementation is a single Python script, [`poc_runtime.py`](/E:/AI%20video%20Detector/poc_runtime.py), backed by a local virtual environment in `venv/`.

## What this project does

The prototype runs two active checks on a video:

- `VisualDetector`: samples 15 frames across the video and sends them through the Hugging Face model `dima806/ai_vs_real_image_detection`.
- `TemporalDetector`: measures frame-to-frame consistency using grayscale mean squared error to catch unnatural flicker or morphing.

The script then combines those signals using a weighted fusion step:

- visual weight: `0.40`
- temporal weight: `0.60`

If the temporal detector finds very strong evidence of normal scene cuts, it reduces the visual detector's influence before calculating the final score.

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
4. Analyze a short middle segment for temporal consistency.
5. Fuse the detector scores into one overall AI probability.
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

The first run may take longer because the Hugging Face model can download its weights into the local cache.

## Current limitations

- Audio detection is only a mock placeholder.
- Metadata detection is only a mock placeholder.
- The visual model is an image detector, not a video-native detector.
- The temporal detector is heuristic and may misread edited real videos or low-quality clips.
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
