import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import argparse
import random
import time
import sys
import cv2
import struct
from typing import Dict, Any, List
import numpy as np
from pathlib import Path
import torch
from PIL import Image

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
    """Legacy VideoMAE detector - kept as a secondary signal."""
    def initialize(self):
        print("  [Visual/VideoMAE] Initializing the locally configured VideoMAE deepfake detector...")
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
        print(f"  [Visual/VideoMAE] Opening {video_path} and sampling frames...")
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

class CLIPVisualDetector(BaseDetector):
    """CLIP zero-shot classifier: compares frames against 'real photo' vs 'AI-generated' text prompts.
    
    Far more effective than VideoMAE for detecting high-quality generators like Sora, Kling, Seedance
    because CLIP understands visual semantics at a much deeper level.
    """
    def initialize(self):
        print("  [Visual/CLIP] Initializing CLIP zero-shot AI video classifier...")
        from transformers import CLIPProcessor, CLIPModel
        model_name = "openai/clip-vit-base-patch32"
        self._processor = CLIPProcessor.from_pretrained(model_name)
        self._model = CLIPModel.from_pretrained(model_name)
        self._model.eval()
        
        # Ensemble of prompts targeting specific visual characteristics
        # Multiple prompt pairs capture different aspects of AI vs real imagery
        self._prompt_pairs = [
            ("a photograph taken by a camera with natural imperfections and lens effects",
             "a computer generated image with unnaturally smooth textures and perfect symmetry"),
            ("a real scene with natural lighting, shadows, and depth of field",
             "a synthetic rendered scene with artificial lighting and unrealistic details"),
            ("a genuine video frame with sensor noise, motion blur, and natural grain",
             "a digitally created frame with clean edges, no grain, and painterly appearance"),
            ("a candid photo of real people with natural skin texture and pores",
             "an AI-generated image of people with waxy skin and distorted features")
        ]
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0

    def analyze(self, video_path: str) -> float:
        print(f"  [Visual/CLIP] Analyzing frames with CLIP zero-shot classification...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Sample 8 evenly spaced frames
        num_samples = min(8, total_frames)
        indices = np.linspace(0, total_frames - 1, num_samples, dtype=int)
        
        ai_scores = []
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Convert BGR to RGB PIL Image
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            
            # Run CLIP zero-shot with EACH prompt pair and average
            frame_ai_probs = []
            for real_prompt, ai_prompt in self._prompt_pairs:
                inputs = self._processor(
                    text=[real_prompt, ai_prompt],
                    images=pil_img,
                    return_tensors="pt",
                    padding=True
                )
                with torch.no_grad():
                    outputs = self._model(**inputs)
                    logits_per_image = outputs.logits_per_image
                    probs = logits_per_image.softmax(dim=1)
                
                # probs[0][1] = probability of the AI prompt
                frame_ai_probs.append(probs[0][1].item())
            
            # Average across all prompt pairs for this frame
            avg_frame_score = float(np.mean(frame_ai_probs))
            ai_scores.append(avg_frame_score)
        
        cap.release()
        
        if not ai_scores:
            return 0.5
        
        self._frames_analyzed = len(ai_scores)
        raw_score = float(np.mean(ai_scores))
        # Apply calibration: CLIP zero-shot tends to be conservative,
        # so we amplify the signal while keeping it bounded [0, 1]
        # A sigmoid-like mapping centered around 0.5
        calibrated = 1.0 / (1.0 + np.exp(-8 * (raw_score - 0.5)))
        self._score = float(calibrated)
        
        # Confidence is based on how consistent the scores are across frames
        score_std = float(np.std(ai_scores))
        self._conf = max(0.5, 1.0 - score_std * 2)
        
        return self._score
    
    def confidence(self) -> float:
        return self._conf
    
    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"CLIP analyzed {self._frames_analyzed} frames via zero-shot classification. AI-generated probability: {self._score*100:.1f}%.",
            "model": "CLIP ViT-B/32 (Zero-Shot)"
        }

class OpticalFlowDetector(BaseDetector):
    """Analyzes optical flow consistency. Real physics creates predictable flow patterns;
    AI generators often produce physically impossible or overly smooth motion."""
    def initialize(self):
        print("  [OpticalFlow] Initializing dense optical flow analyzer...")
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0
        self._flow_smoothness = 0.0
    
    def analyze(self, video_path: str) -> float:
        print(f"  [OpticalFlow] Computing dense optical flow...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        if total_frames < 10:
            return 0.5
        
        # Analyze frames from the middle of the video
        start_frame = max(0, total_frames // 2 - int(fps))
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        ret, prev_frame = cap.read()
        if not ret:
            cap.release()
            return 0.5
        
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        prev_gray = cv2.resize(prev_gray, (320, 240))  # Resize for speed
        
        flow_magnitudes = []
        flow_angle_stds = []
        
        for _ in range(min(30, int(fps * 2))):
            ret, curr_frame = cap.read()
            if not ret:
                break
            curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
            curr_gray = cv2.resize(curr_gray, (320, 240))
            
            # Compute dense optical flow using Farneback
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, curr_gray, None,
                pyr_scale=0.5, levels=3, winsize=15,
                iterations=3, poly_n=5, poly_sigma=1.2, flags=0
            )
            
            magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            flow_magnitudes.append(np.mean(magnitude))
            flow_angle_stds.append(np.std(angle))
            
            prev_gray = curr_gray
        
        cap.release()
        
        if not flow_magnitudes:
            return 0.5
        
        self._frames_analyzed = len(flow_magnitudes)
        
        # Analyze flow characteristics
        avg_magnitude = np.mean(flow_magnitudes)
        magnitude_variance = np.var(flow_magnitudes)
        avg_angle_std = np.mean(flow_angle_stds)
        self._flow_smoothness = float(magnitude_variance)
        
        # AI videos tend to have:
        # 1. Very smooth, uniform flow (low variance in magnitude) — dreamy morphing
        # 2. OR erratic micro-movements (high variance but low magnitude) — jitter
        # Real videos have structured flow with clear object motion
        
        if avg_magnitude < 0.5 and magnitude_variance < 0.1:
            # Almost no motion AND very uniform — static AI generation
            self._score = 0.85
            self._conf = 0.75
        elif magnitude_variance < 0.3 and avg_magnitude > 0.5:
            # Motion exists but is unnaturally smooth — AI morphing
            self._score = 0.80
            self._conf = 0.70
        elif avg_angle_std < 0.8:
            # All motion in the same direction — unnatural uniformity
            self._score = 0.75
            self._conf = 0.65
        elif magnitude_variance > 5.0:
            # High variance with large magnitudes — real scene cuts / camera shake
            self._score = 0.15
            self._conf = 0.80
        else:
            # Natural-looking motion patterns
            self._score = 0.30
            self._conf = 0.60
        
        return self._score
    
    def confidence(self) -> float:
        return self._conf
    
    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"Analyzed {self._frames_analyzed} frame pairs. Flow variance: {self._flow_smoothness:.4f}. " +
                      ("Physically natural motion detected." if self._score < 0.5 else "Unnatural motion patterns (AI-like morphing or jitter)."),
            "model": "Dense Optical Flow (Farneback)"
        }

class CompressionDetector(BaseDetector):
    """Analyzes video compression artifacts. Real camera footage has specific codec characteristics
    that AI generators don't reproduce. Examines DCT block artifacts and bitrate patterns."""
    def initialize(self):
        print("  [Compression] Initializing compression forensics analyzer...")
        self._score = 0.0
        self._conf = 0.0
        self._block_score = 0.0
    
    def analyze(self, video_path: str) -> float:
        print(f"  [Compression] Analyzing compression artifacts...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Sample a few frames from the middle
        start_frame = max(0, total_frames // 2)
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        block_artifact_scores = []
        
        for _ in range(min(5, total_frames)):
            ret, frame = cap.read()
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = gray.astype(np.float64)
            
            # Detect 8x8 DCT block boundaries (H.264/H.265 macroblocking)
            h, w = gray.shape
            h8 = (h // 8) * 8
            w8 = (w // 8) * 8
            gray = gray[:h8, :w8]
            
            # Vectorized: compute horizontal gradient for ALL columns
            horiz_grad = np.abs(np.diff(gray, axis=1))  # shape: (h8, w8-1)
            
            # Columns that are block boundaries: 7, 15, 23, 31, ...
            boundary_cols = np.arange(7, w8 - 1, 8)
            all_cols = np.arange(0, w8 - 1)
            interior_cols = np.setdiff1d(all_cols, boundary_cols)
            
            if len(boundary_cols) > 0 and len(interior_cols) > 0:
                boundary_mean = np.mean(horiz_grad[:, boundary_cols])
                interior_mean = np.mean(horiz_grad[:, interior_cols])
                ratio = boundary_mean / (interior_mean + 1e-8)
                block_artifact_scores.append(ratio)
        
        cap.release()
        
        if not block_artifact_scores:
            return 0.5
        
        avg_block_ratio = np.mean(block_artifact_scores)
        self._block_score = float(avg_block_ratio)
        
        # Real camera video that's been through H.264/265 compression shows 
        # stronger block boundary artifacts (ratio > 1.05)
        if avg_block_ratio > 1.15:
            self._score = 0.10  # Strong block artifacts = Real compressed video
            self._conf = 0.80
        elif avg_block_ratio > 1.05:
            self._score = 0.25  # Moderate block artifacts = Likely real
            self._conf = 0.70
        elif avg_block_ratio < 1.01:
            # Could be AI, or could just be VP9/AV1 (YouTube) which doesn't use 8x8 blocks
            self._score = 0.50  # Neutral
            self._conf = 0.30
        else:
            self._score = 0.45
            self._conf = 0.50
        
        return self._score
    
    def confidence(self) -> float:
        return self._conf
    
    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"Block boundary ratio: {self._block_score:.3f}. " +
                      ("Natural codec compression artifacts detected." if self._score < 0.5 else "Missing typical compression artifacts (AI-like)."),
            "model": "DCT Block Boundary Analysis"
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

class FrequencyDetector(BaseDetector):
    def initialize(self):
        print("  [Frequency] Initializing frequency domain (FFT) analyzer...")
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0

    def analyze(self, video_path: str) -> float:
        print(f"  [Frequency] Analyzing spectral artifacts...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Analyze a few frames from the middle
        start_frame = max(0, total_frames // 2)
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        high_freq_energies = []
        for _ in range(min(5, total_frames)):
            ret, frame = cap.read()
            if not ret: break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Resize for consistent FFT size
            gray = cv2.resize(gray, (512, 512))
            
            f = np.fft.fft2(gray)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-8)
            
            # Mask out low frequencies (center of the image)
            rows, cols = gray.shape
            crow, ccol = rows//2, cols//2
            mask_size = 50
            magnitude_spectrum[crow-mask_size:crow+mask_size, ccol-mask_size:ccol+mask_size] = 0
            
            # Calculate energy in high frequencies
            high_freq_energy = np.mean(magnitude_spectrum[magnitude_spectrum > 0])
            if not np.isnan(high_freq_energy):
                high_freq_energies.append(high_freq_energy)
            
        cap.release()
        
        if not high_freq_energies: return 0.5
        
        avg_hf_energy = np.mean(high_freq_energies)
        self._frames_analyzed = len(high_freq_energies)
        self._hf_energy = avg_hf_energy
        
        # Heuristic: AI generators often have extremely low high-frequency energy due to upsampling smoothing
        # Adjusted for YouTube VP9 compression which also lowers HF energy
        if avg_hf_energy < 50: 
            self._score = 0.85
            self._conf = 0.80
        elif avg_hf_energy > 200:
            self._score = 0.10
            self._conf = 0.80
        else:
            self._score = 0.40 # Default to slightly human
            self._conf = 0.50
            
        return self._score

    def confidence(self) -> float:
        return self._conf

    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"Analyzed {self._frames_analyzed} frames. High-frequency energy: {self._hf_energy:.2f}. " + 
                      ("Unnaturally smooth (Likely AI upsampling)." if self._score > 0.5 else "Natural high-frequency detail detected."),
            "model": "2D FFT Spectral Artifacts"
        }

class NoiseDetector(BaseDetector):
    def initialize(self):
        print("  [Noise] Initializing PRNU sensor noise analyzer...")
        self._score = 0.0
        self._conf = 0.0
        self._frames_analyzed = 0

    def analyze(self, video_path: str) -> float:
        print(f"  [Noise] Extracting noise residuals...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video file: {video_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        start_frame = max(0, total_frames // 2)
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        noise_variances = []
        for _ in range(min(5, total_frames)):
            ret, frame = cap.read()
            if not ret: break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian Blur to get the "signal"
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Subtract to get the "noise" (residual)
            residual = cv2.absdiff(gray, blurred)
            
            variance = np.var(residual)
            noise_variances.append(variance)
            
        cap.release()
        
        if not noise_variances: return 0.5
        
        avg_noise_variance = np.mean(noise_variances)
        self._frames_analyzed = len(noise_variances)
        self._noise_var = avg_noise_variance
        
        # Heuristic: AI videos often completely lack real sensor noise (variance < 1.0).
        # YouTube compression adds artifact noise, so we must be lenient.
        if avg_noise_variance < 1.0:
            self._score = 0.95 # Too clean, lacks PRNU
            self._conf = 0.90
        elif avg_noise_variance > 100.0:
            self._score = 0.80 # Insane noise level (synthetic)
            self._conf = 0.60
        else:
            self._score = 0.20 # Natural moderate sensor/compression noise
            self._conf = 0.85
            
        return self._score

    def confidence(self) -> float:
        return self._conf

    def explain(self) -> Dict[str, Any]:
        return {
            "reason": f"Analyzed {self._frames_analyzed} frames. Residual noise variance: {self._noise_var:.2f}. " + 
                      ("Missing natural PRNU sensor noise." if self._score > 0.5 else "Natural sensor noise detected."),
            "model": "PRNU Residual Variance"
        }

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
        
        # Heuristic: Real videos have varied MSE (smooth motion + cuts).
        # AI often has bizarrely low or erratic MSE. We loosen this to avoid flagging fast real motion.
        if max_diff > 20000:
            self._score = 0.05 # Massive spike = Scene cuts / Professional Editing (Real)
            self._conf = 0.90
        elif variance < 50:
            self._score = 0.85 # Unnaturally static / frozen morphing
            self._conf = 0.80
        elif variance > 50000:
            self._score = 0.20 # High physical motion
            self._conf = 0.70
        else:
            self._score = 0.40 # Standard motion variance
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
    """Combines scores from all detectors using weighted averaging."""
    def __init__(self):
        # Weights optimized for detecting high-quality generative models (Sora/Kling/Seedance)
        # We severely discount visual models because modern AI looks perfectly real
        self.weights = {
            "clip": 0.05,       # Severely reduced: fools easily on photorealistic AI
            "visual": 0.0,      # Disabled (VideoMAE is outdated for new models)
            "audio": 0.0,
            "metadata": 0.0,
            "temporal": 0.35,   # Massive weight: AI struggles with physical temporal consistency
            "frequency": 0.15,  
            "noise": 0.25,      # Massive weight: AI lacks real camera PRNU sensor noise
            "opticalflow": 0.15, # Dense optical flow patterns expose AI morphing
            "compression": 0.05  # Codec compression forensics
        }

    def fuse(self, results: Dict[str, float]) -> float:
        final_score = 0.0
        total_weight = 0.0
        for key, score in results.items():
            weight = self.weights.get(key, 0.0)
            final_score += score * weight
            total_weight += weight
            
        base_score = final_score / total_weight if total_weight > 0 else 0.0
        
        # Non-linear Forensic Overrule:
        # If the low-level physical/pixel forensic detectors strongly agree the video is AI,
        # they should completely overrule the visual semantic models (like CLIP) which get 
        # easily fooled by modern hyper-realistic generators.
        forensic_keys = ['temporal', 'noise', 'opticalflow']
        forensic_scores = [results.get(k, 0.5) for k in forensic_keys if k in results]
        
        if len(forensic_scores) > 0:
            avg_forensic = sum(forensic_scores) / len(forensic_scores)
            
            # If forensics highly indicate AI (e.g., lack of sensor noise + impossible physics)
            if avg_forensic > 0.70:
                # Exponentially boost the score towards the forensic average
                boosted_score = (base_score * 0.15) + (avg_forensic * 0.85)
                return min(0.99, boosted_score)
                
        return base_score

def analyze_video(video_path: str):
    print(f"=== Starting AI Video Authenticity Analysis (V1) ===")
    print(f"Target: {video_path}\n")
    
    # 1. Initialize Detectors
    detectors = {
        "clip": CLIPVisualDetector(),
        "visual": VisualDetector(),
        "audio": MockAudioDetector(),
        "metadata": MockMetadataDetector(),
        "temporal": TemporalDetector(),
        "frequency": FrequencyDetector(),
        "noise": NoiseDetector(),
        "opticalflow": OpticalFlowDetector(),
        "compression": CompressionDetector()
    }
    
    for d in detectors.values():
        d.initialize()
        
    # 2. Run Processing Pipeline
    scores = {}
    explanations = {}
    
    for key, detector in detectors.items():
        if key not in ("clip", "visual", "temporal", "frequency", "noise", "opticalflow", "compression"):
            continue # Skip disabled detectors
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
        "summary": explanations.get("temporal", {}).get("details", {}).get("reason", "Analyzed video for AI manipulation."),
        "detectors": explanations
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
