// API Service Layer for AI Video Detection

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

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Uploads a video file for analysis.
 */
export async function analyzeVideoFile(file: File): Promise<AnalysisResult> {
  console.log(`[API] Analyzing video file: ${file.name}`);
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze-video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submits a video URL for analysis.
 */
export async function analyzeVideoUrl(url: string): Promise<AnalysisResult> {
  console.log(`[API] Analyzing video URL: ${url}`);
  
  const response = await fetch(`${API_BASE_URL}/analyze-video-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches analysis history.
 */
export async function getAnalysisHistory(): Promise<VideoHistoryItem[]> {
  console.log('[API] Fetching history');
  const response = await fetch(`${API_BASE_URL}/history`);
  
  if (!response.ok) {
    console.error('Failed to fetch history', response);
    return [];
  }
  
  return response.json();
}

/**
 * Fetches dashboard statistics.
 */
export async function getDashboardStats() {
  console.log('[API] Fetching stats');
  const response = await fetch(`${API_BASE_URL}/stats`);
  
  if (!response.ok) {
    console.error('Failed to fetch stats', response);
    return {
      analyzed: '--',
      aiDetected: '--',
      authentic: '--',
      pending: '--'
    };
  }
  
  return response.json();
}
