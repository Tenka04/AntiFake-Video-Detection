"""Model adapters used by inference components."""

from .videomae_detector import VideoMAEDeepfakeDetector, VideoMAEModelError, VideoMAEPrediction

__all__ = ["VideoMAEDeepfakeDetector", "VideoMAEModelError", "VideoMAEPrediction"]
