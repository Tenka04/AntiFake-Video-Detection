"""Video metadata extraction and frame sampling utilities."""

from .video_loader import VideoMetadata, VideoProcessingError, inspect_video
from .frame_sampler import SampledFrames, sample_uniform_frames

__all__ = [
    "SampledFrames",
    "VideoMetadata",
    "VideoProcessingError",
    "inspect_video",
    "sample_uniform_frames",
]
