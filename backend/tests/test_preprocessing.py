from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import cv2
import numpy as np

from app.preprocessing import VideoProcessingError, inspect_video, sample_uniform_frames


def create_video(path: Path, frame_count: int, size: tuple[int, int] = (64, 48)) -> None:
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 10, size)
    if not writer.isOpened():
        raise RuntimeError("OpenCV could not create test MP4 video.")
    for index in range(frame_count):
        writer.write(np.full((size[1], size[0], 3), index * 20, dtype=np.uint8))
    writer.release()


class PreprocessingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_directory = tempfile.TemporaryDirectory()
        self.video_path = Path(self.temp_directory.name) / "short.mp4"
        create_video(self.video_path, frame_count=3)

    def tearDown(self) -> None:
        self.temp_directory.cleanup()

    def test_inspect_video_returns_metadata(self) -> None:
        metadata = inspect_video(self.video_path)
        self.assertEqual((metadata.width, metadata.height), (64, 48))
        self.assertEqual(metadata.frame_count, 3)
        self.assertAlmostEqual(metadata.fps or 0, 10.0)
        self.assertAlmostEqual(metadata.duration_seconds or 0, 0.3)

    def test_short_video_returns_unique_frames(self) -> None:
        sampled = sample_uniform_frames(self.video_path, requested_count=16, output_size=(32, 32))
        self.assertEqual(sampled.frames.shape, (3, 32, 32, 3))
        self.assertEqual(sampled.frame_indices, [0, 1, 2])

    def test_corrupt_video_returns_controlled_error(self) -> None:
        corrupt = Path(self.temp_directory.name) / "corrupt.mp4"
        corrupt.write_bytes(b"not a video")
        with self.assertRaises(VideoProcessingError):
            inspect_video(corrupt)

    def test_invalid_sampling_arguments_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            sample_uniform_frames(self.video_path, requested_count=0)
        with self.assertRaises(ValueError):
            sample_uniform_frames(self.video_path, output_size=(0, 224))
