import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Search, Fingerprint, ActivitySquare, Waves, FileArchive, Eye } from 'lucide-react';
import type { AnalysisResult } from '../../services/api';
import { cn } from '../../lib/utils';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const aiScore = result.ai_probability || 0;
  const confidence = result.confidence || 0;
  
  // Use thresholds matching the backend verdict logic
  const isAiGenerated = aiScore >= 0.75;
  const isAuthentic = aiScore <= 0.35;
  const isInconclusive = !isAiGenerated && !isAuthentic;
  
  const statusColor = isAiGenerated 
    ? "text-danger bg-danger/20 border-danger/30" 
    : isAuthentic
      ? "text-success bg-success/20 border-success/30"
      : "text-yellow-500 bg-yellow-500/20 border-yellow-500/30";
      
  const themeColor = isAiGenerated ? "stroke-danger" : isAuthentic ? "stroke-success" : "stroke-yellow-500";
  const glowColor = isAiGenerated ? "bg-danger" : isAuthentic ? "bg-success" : "bg-yellow-500";

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (aiScore * circumference);

  // Map detector names to icons
  const getDetectorIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('clip') || n.includes('visual')) return <Eye className="w-4 h-4 text-blue-400" />;
    if (n.includes('temporal')) return <ActivitySquare className="w-4 h-4 text-purple-400" />;
    if (n.includes('frequency')) return <Waves className="w-4 h-4 text-cyan-400" />;
    if (n.includes('noise')) return <Fingerprint className="w-4 h-4 text-green-400" />;
    if (n.includes('compression')) return <FileArchive className="w-4 h-4 text-orange-400" />;
    return <Search className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="w-full bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none",
        glowColor
      )}></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Analysis Results
            <span className={cn("px-3 py-1 text-xs rounded-full border flex items-center gap-1", statusColor)}>
              {isAiGenerated ? (
                <><AlertTriangle className="w-3 h-3" /> AI Generated</>
              ) : isAuthentic ? (
                <><CheckCircle className="w-3 h-3" /> Likely Authentic</>
              ) : (
                <><Search className="w-3 h-3" /> Needs Manual Review</>
              )}
            </span>
          </h2>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span className="font-mono bg-black/40 px-2 py-0.5 rounded">ID: {result.id}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(result.timestamp).toLocaleTimeString()}</span>
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center min-w-[100px]">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3 text-primary" /> Confidence</div>
            <div className="text-xl font-bold text-white">{Math.round(confidence * 100)}%</div>
          </div>
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center min-w-[100px]">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3 text-secondary" /> Engine</div>
            <div className="text-sm font-medium text-white truncate max-w-[90px]" title={result.model_info || 'AntiFake V2'}>
              {result.model_info || 'AntiFake V2'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Score Gauge */}
        <div className="col-span-1 md:col-span-4 bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center relative shadow-inner">
          <h3 className="text-gray-400 font-medium mb-6">AI Probability Score</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90 absolute">
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/10"
              />
              {/* Progress Circle */}
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn("transition-all duration-1500 ease-out", themeColor)}
              />
            </svg>
            <div className="flex flex-col items-center justify-center absolute">
              <span className={cn(
                "text-5xl font-black tracking-tighter",
                isAiGenerated ? "text-danger" : isAuthentic ? "text-success" : "text-yellow-500"
              )}>
                {Math.round(aiScore * 100)}<span className="text-2xl text-gray-500">%</span>
              </span>
            </div>
          </div>
          
          <div className="w-full flex justify-between mt-8 text-xs font-medium text-gray-500 px-4">
            <span className="flex flex-col items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span>Human</span>
            <span className="flex flex-col items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger"></span>AI Generated</span>
          </div>
        </div>

        {/* Detector Breakdown */}
        <div className="col-span-1 md:col-span-8 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Forensic Evidence Breakdown</h3>
          
          <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden flex-1">
            {result.detectors && result.detectors.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {result.detectors.map((detector, idx) => (
                  <div key={idx} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getDetectorIcon(detector.name)}
                        <span className="font-semibold text-gray-200">{detector.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Conf: {Math.round(detector.confidence * 100)}%</span>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border",
                          detector.ai_score > 0.6 ? "bg-danger/10 text-danger border-danger/20" :
                          detector.ai_score < 0.4 ? "bg-success/10 text-success border-success/20" :
                          "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        )}>
                          Score: {Math.round(detector.ai_score * 100)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 pl-6 leading-relaxed">
                      {detector.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                <p>{result.summary || "No detailed detector breakdown available for this analysis."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
