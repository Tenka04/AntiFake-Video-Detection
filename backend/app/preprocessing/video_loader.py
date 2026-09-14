"""Safe, dependency-light video inspection based on OpenCV.

Audio stream probing is best-effort: OpenCV does not reliably expose stream
metadata on every platform, so an unavailable value is represented as ``None``
rather than guessed.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
import shutil
import subprocess
from typing import Any

import cv2


class VideoProcessingError(ValueError):
    """Raised when a video cannot be safely inspected or decoded."""


@dataclass(frozen=True)
class VideoMetadata:
    path: str
    fps: float | None
    width: int
    height: int
    frame_count: int | None
    duration_seconds: float | None
    codec: str | None
    has_audio: bool | None

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def _decode_fourcc(value: float) -> str | None:
    code = int(value)
    if code <= 0:
        return None
    text = "".join(chr((code >> (8 * index)) & 0xFF) for index in range(4)).strip()
    return text or None


def _probe_audio_with_ffprobe(path: Path) -> bool | None:
    """Return audio availability when ffprobe is installed; otherwise None."""
    executable = shutil.which("ffprobe")
    if executable is None:
        return None
    command = [
        executable,
        "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=index",
        "-of", "csv=p=0",
        str(path),
    ]
    try:
        completed = subprocess.run(command, capture_output=True, text=True, timeout=15, check=False)
    except (OSError, subprocess.TimeoutExpired):
        return None
    if completed.returncode != 0:
        return None
    return bool(completed.stdout.strip())


def inspect_video(video_path: str | Path) -> VideoMetadata:
    """Read stable metadata and verify that at least one frame can be decoded."""
    path = Path(video_path)
    if not path.is_file():
        raise VideoProcessingError("Video file does not exist.")

    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise VideoProcessingError("Video could not be opened; it may be corrupted or unsupported.")
    try:
        fps_value = float(capture.get(cv2.CAP_PROP_FPS))
        fps = fps_value if fps_value > 0 else None
        frame_count_value = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_count = frame_count_value if frame_count_value > 0 else None
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        if width <= 0 or height <= 0:
            raise VideoProcessingError("Video has no readable resolution.")
        readable, _ = capture.read()
        if not readable:
            raise VideoProcessingError("Video contains no decodable frames.")
        duration = frame_count / fps if frame_count is not None and fps is not None else None
        return VideoMetadata(
            path=str(path),
            fps=fps,
            width=width,
            height=height,
            frame_count=frame_count,
            duration_seconds=duration,
            codec=_decode_fourcc(capture.get(cv2.CAP_PROP_FOURCC)),
            has_audio=_probe_audio_with_ffprobe(path),
        )
    finally:
        capture.release()
