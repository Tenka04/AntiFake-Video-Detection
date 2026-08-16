// API Service Layer for AI Video Detection
// This file contains placeholder functions to be connected to your actual backend later.

export interface AnalysisResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  ai_probability?: number;
  human_probability?: number;
  confidence?: number;
  processing_time?: number;
  model_info?: string;
  timestamp: string;
}

export interface VideoHistoryItem {
  id: string;
  filename: string;
  date: string;
  status: 'completed' | 'failed' | 'processing';
  result?: 'AI Generated' | 'Likely Authentic' | 'Needs Review';
  confidence?: number;
}

// TODO: Replace with your actual backend URL when available
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Uploads a video file for analysis.
 * TODO: Connect to backend endpoint (e.g., POST /api/analyze-video)
 */
export async function analyzeVideoFile(file: File): Promise<AnalysisResult> {
  console.log(`[API Mock] Analyzing video file: ${file.name}`);
  
  // Simulated delay for frontend testing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        status: 'completed',
        ai_probability: 0.85,
        human_probability: 0.15,
        confidence: 0.92,
        processing_time: 2.4,
        model_info: 'v2.1-ensemble',
        timestamp: new Date().toISOString()
      });
    }, 2500);
  });
}

/**
 * Submits a video URL for analysis.
 * TODO: Connect to backend endpoint
 */
export async function analyzeVideoUrl(url: string): Promise<AnalysisResult> {
  console.log(`[API Mock] Analyzing video URL: ${url}`);
  
  // Simulated delay for frontend testing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        status: 'completed',
        ai_probability: 0.12,
        human_probability: 0.88,
        confidence: 0.96,
        processing_time: 1.8,
        model_info: 'v2.1-ensemble',
        timestamp: new Date().toISOString()
      });
    }, 2000);
  });
}

/**
 * Fetches analysis history.
 * TODO: Connect to backend endpoint (e.g., GET /api/history)
 */
export async function getAnalysisHistory(): Promise<VideoHistoryItem[]> {
  console.log('[API Mock] Fetching history');
  // Return empty array to demonstrate empty state as requested, 
  // or mock data if needed for testing UI
  return Promise.resolve([]);
}

/**
 * Fetches dashboard statistics.
 * TODO: Connect to backend endpoint
 */
export async function getDashboardStats() {
  console.log('[API Mock] Fetching stats');
  return Promise.resolve({
    analyzed: '--',
    aiDetected: '--',
    authentic: '--',
    pending: '--'
  });
}
