import { useState } from 'react';
import { VideoDropzone } from '../components/video/VideoDropzone';
import { VideoUrlInput } from '../components/video/VideoUrlInput';
import { VideoPreview } from '../components/video/VideoPreview';
import { AnalyzeButton } from '../components/analysis/AnalyzeButton';
import { ResultCard } from '../components/analysis/ResultCard';
import { analyzeVideoFile, analyzeVideoUrl } from '../services/api';
import type { AnalysisResult } from '../services/api';
import { cn } from '../lib/utils';

export function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl('');
    setResult(null);
  };

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    setSelectedFile(null);
    setResult(null);
  };

  const handleRemoveVideo = () => {
    setSelectedFile(null);
    setVideoUrl('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !videoUrl) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      let analysisResult;
      if (selectedFile) {
        analysisResult = await analyzeVideoFile(selectedFile);
      } else {
        analysisResult = await analyzeVideoUrl(videoUrl);
      }
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed", error);
      // TODO: Show error toast
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasVideo = !!selectedFile || !!videoUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12 mt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          AI-Powered Video Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Detect <span className="gradient-text">AI-Generated</span> Videos
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Upload a video or provide a video URL to analyze its authenticity using advanced AI detection models.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-surface/20 border border-white/5 rounded-3xl p-2 shadow-2xl backdrop-blur-xl">
        {/* Tabs */}
        {!hasVideo && (
          <div className="flex p-1 bg-black/40 rounded-2xl mb-6 w-full max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-all",
                activeTab === 'upload' ? "bg-surface shadow-md text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-all",
                activeTab === 'url' ? "bg-surface shadow-md text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              Video URL
            </button>
          </div>
        )}

        <div className="p-4 md:p-6">
          {!hasVideo ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {activeTab === 'upload' ? (
                <VideoDropzone onFileSelect={handleFileSelect} />
              ) : (
                <VideoUrlInput onSubmit={handleUrlSubmit} />
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <VideoPreview 
                file={selectedFile || undefined} 
                url={videoUrl || undefined} 
                onRemove={handleRemoveVideo} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      {hasVideo && (
        <AnalyzeButton 
          onClick={handleAnalyze} 
          isAnalyzing={isAnalyzing} 
          disabled={!hasVideo} 
        />
      )}

      {/* Results Section */}
      <div className="mt-12">
        {result ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <ResultCard result={result} />
          </div>
        ) : (
          <div className="w-full bg-surface/20 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-4 border border-white/5">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">Analysis results will appear here</h3>
            <p className="text-sm text-gray-600">Submit a video above to see detailed AI detection metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
