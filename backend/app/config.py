"""Configuration shared by preprocessing and future inference components."""

from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class PreprocessingSettings:
    """Safe, environment-configurable defaults for video preprocessing."""

    frame_count: int = 16
    frame_width: int = 224
    frame_height: int = 224
    max_upload_size_bytes: int = 500 * 1024 * 1024
    allowed_extensions: tuple[str, ...] = (".mp4", ".mov", ".avi", ".mkv")

    @classmethod
    def from_environment(cls) -> "PreprocessingSettings":
        return cls(
            frame_count=int(os.getenv("VIDEO_FRAME_COUNT", "16")),
            frame_width=int(os.getenv("VIDEO_FRAME_WIDTH", "224")),
            frame_height=int(os.getenv("VIDEO_FRAME_HEIGHT", "224")),
            max_upload_size_bytes=int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(500 * 1024 * 1024))),
        )


@dataclass(frozen=True)
class ModelSettings:
    """Configuration for the video-native deepfake detector."""

    checkpoint: str = "models/videomae-deepfake"
    device: str = "auto"
    frame_count: int = 16

    @classmethod
    def from_environment(cls) -> "ModelSettings":
        return cls(
            checkpoint=os.getenv("VIDEOMAE_CHECKPOINT", cls.checkpoint),
            device=os.getenv("MODEL_DEVICE", "auto"),
            frame_count=int(os.getenv("VIDEO_FRAME_COUNT", "16")),
        )
