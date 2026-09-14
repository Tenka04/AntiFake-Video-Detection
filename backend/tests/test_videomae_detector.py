from __future__ import annotations

import unittest

import torch

from app.models.videomae_detector import VideoMAEDeepfakeDetector, VideoMAEModelError


class VideoMAEDetectorTests(unittest.TestCase):
    def test_maps_real_and_fake_labels(self) -> None:
        logits = torch.tensor([[1.0, 3.0]])
        ai_probability, real_probability = VideoMAEDeepfakeDetector._class_probabilities(
            logits, {0: "REAL", 1: "FAKE"}
        )
        self.assertGreater(ai_probability, real_probability)
        self.assertAlmostEqual(ai_probability + real_probability, 1.0, places=6)

    def test_rejects_unknown_checkpoint_labels(self) -> None:
        with self.assertRaises(VideoMAEModelError):
            VideoMAEDeepfakeDetector._class_probabilities(torch.tensor([[1.0, 1.0]]), {0: "CAT", 1: "DOG"})
