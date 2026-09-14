"""Video-native deepfake inference with a fine-tuned VideoMAE checkpoint.

The default checkpoint is trained on FaceForensics++ and is a research baseline,
not a calibrated universal AI-video detector. It must be evaluated on the
project's held-out target generators before its probabilities are treated as
forensic conclusions.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
from transformers import VideoMAEForVideoClassification, VideoMAEImageProcessor

from ..config import ModelSettings
from ..preprocessing import sample_uniform_frames


class VideoMAEModelError(RuntimeError):
    """Raised when the configured VideoMAE checkpoint cannot be loaded."""


@dataclass(frozen=True)
class VideoMAEPrediction:
    ai_probability: float
    real_probability: float
    confidence: float
    frame_indices: list[int]
    timestamps_seconds: list[float | None]
    model_name: str
    device: str


class VideoMAEDeepfakeDetector:
    """Loads one explicitly configured VideoMAE deepfake classifier."""

    def __init__(self, settings: ModelSettings | None = None) -> None:
        self.settings = settings or ModelSettings.from_environment()
        self.device = self._resolve_device(self.settings.device)
        self.model: VideoMAEForVideoClassification | None = None
        self.processor: VideoMAEImageProcessor | None = None

    @staticmethod
    def _resolve_device(requested_device: str) -> torch.device:
        if requested_device == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        if requested_device == "cuda" and not torch.cuda.is_available():
            raise VideoMAEModelError("MODEL_DEVICE=cuda was requested, but CUDA is unavailable.")
        return torch.device(requested_device)

    def load(self, *, local_files_only: bool = False) -> None:
        """Load the exact configured checkpoint; never substitute another model."""
        try:
            self.processor = VideoMAEImageProcessor.from_pretrained(
                self.settings.checkpoint, local_files_only=local_files_only
            )
            self.model = VideoMAEForVideoClassification.from_pretrained(
                self.settings.checkpoint, local_files_only=local_files_only
            ).to(self.device)
            self.model.eval()
        except (OSError, ValueError) as error:
            raise VideoMAEModelError(
                f"Could not load VideoMAE checkpoint '{self.settings.checkpoint}'."
            ) from error

    @staticmethod
    def _class_probabilities(logits: torch.Tensor, id2label: dict[int, str] | dict[str, str]) -> tuple[float, float]:
        probabilities = torch.softmax(logits, dim=-1)[0].detach().cpu().tolist()
        normalized_labels = {int(index): str(label).strip().upper() for index, label in id2label.items()}
        fake_index = next(
            (index for index, label in normalized_labels.items() if label in {"FAKE", "AI", "AI_GENERATED", "DEEPFAKE"}),
            None,
        )
        real_index = next((index for index, label in normalized_labels.items() if label in {"REAL", "AUTHENTIC"}), None)
        if fake_index is None or real_index is None:
            raise VideoMAEModelError(f"Checkpoint has unsupported class labels: {normalized_labels}")
        return float(probabilities[fake_index]), float(probabilities[real_index])

    @torch.inference_mode()
    def predict(self, video_path: str | Path) -> VideoMAEPrediction:
        if self.model is None or self.processor is None:
            raise VideoMAEModelError("Call load() before predict().")
        sampled = sample_uniform_frames(video_path, requested_count=self.settings.frame_count)
        inputs: dict[str, Any] = self.processor(list(sampled.frames), return_tensors="pt")
        pixel_values = inputs["pixel_values"].to(self.device)
        outputs = self.model(pixel_values=pixel_values)
        ai_probability, real_probability = self._class_probabilities(outputs.logits, self.model.config.id2label)
        return VideoMAEPrediction(
            ai_probability=ai_probability,
            real_probability=real_probability,
            confidence=max(ai_probability, real_probability),
            frame_indices=sampled.frame_indices,
            timestamps_seconds=sampled.timestamps_seconds,
            model_name=self.settings.checkpoint,
            device=str(self.device),
        )
