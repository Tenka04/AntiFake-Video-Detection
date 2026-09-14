"""Uniform frame sampling for video-native model input."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from .video_loader import VideoProcessingError, inspect_video


@dataclass(frozen=True)
class SampledFrames:
    frames: np.ndarray
    frame_indices: list[int]
    timestamps_seconds: list[float | None]


def _uniform_indices(frame_count: int, requested_count: int) -> list[int]:
    if requested_count < 1:
        raise ValueError("requested_count must be at least 1.")
    if frame_count < 1:
        raise VideoProcessingError("Video has no frames available for sampling.")
    actual_count = min(frame_count, requested_count)
    return np.linspace(0, frame_count - 1, num=actual_count, dtype=np.int64).tolist()


def sample_uniform_frames(
    video_path: str | Path,
    *,
    requested_count: int = 16,
    output_size: tuple[int, int] = (224, 224),
) -> SampledFrames:
    """Return RGB frames uniformly distributed across a decodable video.

    Short clips intentionally return fewer unique frames instead of duplicating
    evidence. Callers can use the returned frame count when batching a model.
    """
    if output_size[0] < 1 or output_size[1] < 1:
        raise ValueError("output_size dimensions must be positive.")
    metadata = inspect_video(video_path)
    if metadata.frame_count is None:
        raise VideoProcessingError("Frame count is unavailable; uniform sampling cannot be performed.")
    indices = _uniform_indices(metadata.frame_count, requested_count)
    capture = cv2.VideoCapture(str(video_path))
    frames: list[np.ndarray] = []
    sampled_indices: list[int] = []
    try:
        for index in indices:
            capture.set(cv2.CAP_PROP_POS_FRAMES, index)
            readable, frame = capture.read()
            # Some codecs over-report CAP_PROP_FRAME_COUNT by one or more
            # frames. Keep the sample count stable by choosing the nearest
            # unselected decodable frame rather than silently losing evidence.
            if not readable:
                for candidate in range(index - 1, -1, -1):
                    if candidate in sampled_indices:
                        continue
                    capture.set(cv2.CAP_PROP_POS_FRAMES, candidate)
                    readable, frame = capture.read()
                    if readable:
                        index = candidate
                        break
            if not readable:
                continue
            resized = cv2.resize(frame, output_size, interpolation=cv2.INTER_AREA)
            frames.append(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))
            sampled_indices.append(index)
    finally:
        capture.release()
    if not frames:
        raise VideoProcessingError("No requested frames could be decoded.")
    timestamps = [index / metadata.fps if metadata.fps else None for index in sampled_indices]
    return SampledFrames(
        frames=np.stack(frames),
        frame_indices=sampled_indices,
        timestamps_seconds=timestamps,
    )
