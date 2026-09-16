import { useState } from 'react';
import { VideoDropzone } from '../components/video/VideoDropzone';
import { VideoUrlInput } from '../components/video/VideoUrlInput';
import { VideoPreview } from '../components/video/VideoPreview';
import { AnalyzeButton } from '../components/analysis/AnalyzeButton';
import { ResultCard } from '../components/analysis/ResultCard';
import { analyzeVideoFile, analyzeVideoUrl } from '../services/api';
import type { AnalysisResult } from '../services/api';
import { cn } from '../lib/utils';
import { SupportedGenerators } from '../components/layout/SupportedGenerators';
import { HowItWorks } from '../components/layout/HowItWorks';
import { ShieldCheck } from 'lucide-react';

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
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Detect <span className="gradient-text">AI-Generated</span> Videos
        </h1>
        <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto text-lg mb-6">
          Upload a video or provide a video URL to analyze its authenticity using advanced AI detection models.
        </p>
        
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-surface/30 border border-slate-200/80 dark:border-white/5 rounded-lg shadow-xs backdrop-blur-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-green-400" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900 dark:text-white">Powered by AntiFake</span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span className="text-slate-500 dark:text-gray-400">The First Word in AI Verification</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white/70 dark:bg-surface/20 border border-slate-200/80 dark:border-white/5 rounded-3xl p-2 shadow-xl backdrop-blur-xl transition-colors">
        {/* Tabs */}
        {!hasVideo && (
          <div className="flex p-1 bg-slate-200/60 dark:bg-black/40 rounded-2xl mb-6 w-full max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
                activeTab === 'upload' ? "bg-white dark:bg-surface shadow-md text-slate-900 dark:text-white font-semibold" : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
              )}
            >
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
                activeTab === 'url' ? "bg-white dark:bg-surface shadow-md text-slate-900 dark:text-white font-semibold" : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
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
          <div className="w-full bg-white/40 dark:bg-surface/20 border border-slate-300 dark:border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-black/40 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
              <svg className="w-8 h-8 text-slate-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-gray-300 mb-2">Analysis results will appear here</h3>
            <p className="text-sm text-slate-500 dark:text-gray-600">Submit a video above to see detailed AI detection metrics.</p>
          </div>
        )}
      </div>
      
      {/* Educational Sections */}
      {!hasVideo && !result && (
        <div className="animate-in fade-in duration-700 delay-300">
          <SupportedGenerators />
          <HowItWorks />
        </div>
      )}
    </div>
  );
}
