import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import argparse
import random
import time
import sys
import cv2
from typing import Dict, Any, List
import numpy as np
from pathlib import Path

from backend.app.config import ModelSettings
from backend.app.models import VideoMAEDeepfakeDetector, VideoMAEModelError


class ModelUnavailableError(RuntimeError):
    """Raised when the configured detector checkpoint is not available locally."""

class BaseDetector:
    """Base interface that all detectors must implement (Section 9 of plan)"""
    def initialize(self):
        pass

    def analyze(self, video_path: str) -> float:
        """Returns AI probability score (0.0 to 1.0)"""
        raise NotImplementedError

    def confidence(self) -> float:
        """Returns confidence of the detector (0.0 to 1.0)"""
        raise NotImplementedError

    def explain(self) -> Dict[str, Any]:
        """Returns reasoning"""
        raise NotImplementedError
        
    def cleanup(self):
        pass

class VisualDetector(BaseDetector):
    def initialize(self):
        print("  [Visual] Initializing the locally configured VideoMAE deepfake detector...")
        try:
            checkpoint = os.getenv(
                "VIDEOMAE_CHECKPOINT",
                str(Path(__file__).resolve().parent / "backend" / "models" / "videomae-deepfake"),
            )
            self.detector = VideoMAEDeepfakeDetector(ModelSettings(checkpoint=checkpoint))
            self.detector.load(local_files_only=True)
        except VideoMAEModelError as error:
            raise ModelUnavailableError(
                "The configured visual detector is incomplete or unavailable locally. "
                "Install the model's complete checkpoint before running inference."
            ) from error
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0

    def analyze(self, video_path: str) -> float:
        print(f"  [Visual] Opening {video_path} and sampling frames for VideoMAE...")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        prediction = self.detector.predict(video_path)
        self._frames_analyzed = len(prediction.frame_indices)
        self._score = prediction.ai_probability
        self._conf = prediction.confidence
        self._model_name = prediction.model_name
        
        return self._score
        
    def confidence(self) -> float:
        return self._conf
        
    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"VideoMAE analyzed {self._frames_analyzed} uniformly sampled frames. AI-generated probability was {self._score*100:.1f}%.",
            "model": self._model_name
        }

class MockAudioDetector(BaseDetector):
    def analyze(self, video_path: str) -> float:
        self._score = 0.0
        self._conf = 0.0
        return self._score
    def confidence(self) -> float: return self._conf
    def explain(self) -> Dict[str, Any]: return {"reason": "Disabled for V1", "model": "N/A"}

class MockMetadataDetector(BaseDetector):
    def analyze(self, video_path: str) -> float:
        self._score = 0.0
        self._conf = 0.0
        return self._score
    def confidence(self) -> float: return self._conf
    def explain(self) -> Dict[str, Any]: return {"reason": "Disabled for V1", "tool": "N/A"}

class TemporalDetector(BaseDetector):
    def initialize(self):
        print("  [Temporal] Initializing frame consistency analyzer...")
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0
        self._variance = 0.0

    def analyze(self, video_path: str) -> float:
        print(f"  [Temporal] Analyzing inter-frame consistency and motion...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        if total_frames < 10:
            return 0.5 # Too short to tell
            
        # Analyze a 2-second clip from the middle of the video
        start_frame = max(0, total_frames // 2 - int(fps))
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        diffs = []
        ret, prev_frame = cap.read()
        if ret:
            prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
            for _ in range(int(fps * 2)): # Check up to 2 seconds
                ret, curr_frame = cap.read()
                if not ret:
                    break
                curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
                
                # Calculate mean squared error between consecutive frames
                err = np.sum((prev_gray.astype("float") - curr_gray.astype("float")) ** 2)
                err /= float(prev_gray.shape[0] * prev_gray.shape[1])
                diffs.append(err)
                
                prev_gray = curr_gray
                
        cap.release()
        
        if not diffs:
            return 0.5
            
        self._frames_analyzed = len(diffs)
        
        # Calculate the variance of the frame differences
        variance = np.var(diffs)
        self._variance = variance
        
        max_diff = np.max(diffs)
        
        # Heuristic: Real videos usually have structured variance (smooth motion OR massive spikes from sharp cuts).
        # Massive single-frame spikes (>2000) are almost always intentional scene cuts in real professional editing.
        # AI videos often have constant micro-morphing/flickering, leading to high variance without single massive spikes.
        if variance < 10:
            self._score = 0.85 # Unnaturally static
            self._conf = 0.70
        elif max_diff > 2000:
            self._score = 0.05 # Massive spike = Scene cuts / Professional Editing (Real)
            self._conf = 0.90
        elif variance > 500:
            self._score = 0.85 # High variance but no massive spikes = Severe AI morphing
            self._conf = 0.80
        else:
            self._score = 0.60 # Mid-range variance (Possible AI morphing/flickering)
            self._conf = 0.60
            
        return self._score
        
    def confidence(self) -> float:
        return self._conf
        
    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"Analyzed {self._frames_analyzed} sequential frames. Motion variance: {self._variance:.2f}. " + 
                      ("Natural motion detected." if self._score < 0.5 else "Unnatural temporal flickering/morphing detected."),
            "model": "Inter-frame MSE Variance Heuristic"
        }

class FusionEngine:
    """Combines scores based on weights"""
    def __init__(self):
        # Adjusted weights for V3: 60/40 balance prioritizing Temporal flow
        self.weights = {
            "visual": 0.40,
            "audio": 0.0,
            "metadata": 0.0,
            "temporal": 0.60
        }

    def fuse(self, results: Dict[str, float]) -> float:
        final_score = 0.0
        total_weight = 0.0
        for key, score in results.items():
            weight = self.weights.get(key, 0.0)
            final_score += score * weight
            total_weight += weight
            
        return final_score / total_weight if total_weight > 0 else 0.0

def analyze_video(video_path: str):
    print(f"=== Starting AI Video Authenticity Analysis (V1) ===")
    print(f"Target: {video_path}\n")
    
    # 1. Initialize Detectors
    detectors = {
        "visual": VisualDetector(),
        "audio": MockAudioDetector(),
        "metadata": MockMetadataDetector(),
        "temporal": TemporalDetector()
    }
    
    for d in detectors.values():
        d.initialize()
        
    # 2. Run Processing Pipeline
    scores = {}
    explanations = {}
    
    for key, detector in detectors.items():
        if key not in ("visual", "temporal"):
            continue # Skip running others for now to save time
        score = detector.analyze(video_path)
        conf = detector.confidence()
        scores[key] = score
        explanations[key] = {
            "score": round(score, 4),
            "confidence": round(conf, 4),
            "details": detector.explain()
        }
        
    # 3. Fuse Scores
    fusion = FusionEngine()
    final_score = fusion.fuse(scores)
    # Only calculate confidence for non-zero weights
    active_weight = sum(fusion.weights[key] for key in scores)
    overall_conf = (
        sum(detectors[key].confidence() * fusion.weights[key] for key in scores) / active_weight
        if active_weight > 0
        else 0.0
    )
    
    # 4. Clean up
    for d in detectors.values():
        d.cleanup()
        
    # 5. Output Report
    print("\n" + "="*45)
    print("                REPORT")
    print("="*45)
    
    # Determine verdict using proper safety margins
    if final_score >= 0.75:
        verdict = "LIKELY AI-GENERATED / MANIPULATED"
    elif final_score <= 0.35:
        verdict = "LIKELY AUTHENTIC"
    else:
        verdict = "INCONCLUSIVE (NEEDS MANUAL REVIEW)"
        
    print(f"Verdict:              {verdict}")
    print(f"Overall AI Score:     {final_score * 100:.2f}%")
    print(f"Overall Confidence:   {overall_conf * 100:.2f}%\n")
    
    print("Evidence Breakdown:")
    for key, data in explanations.items():
        print(f"  [{key.upper()}] - Weight: {fusion.weights[key]*100:.0f}%")
        print(f"    AI Score:   {data['score']*100:.1f}% (Conf: {data['confidence']*100:.1f}%)")
        print(f"    Reasoning:  {data['details']['reason']}")
        print(f"    Model/Tool: {data['details']['model' if 'model' in data['details'] else 'tool']}\n")
    print("="*45)

    return {
        "score": final_score,
        "confidence": overall_conf,
        "verdict": verdict,
        "summary": explanations.get("temporal", {}).get("details", {}).get("reason", "Analyzed video for AI manipulation.")
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Video Authenticity Analyzer POC")
    parser.add_argument("video", help="Path to the video file to analyze")
    args = parser.parse_args()
    
    try:
        analyze_video(args.video)
    except ModelUnavailableError as error:
        print(f"Analysis unavailable: {error}", file=sys.stderr)
        raise SystemExit(2)
