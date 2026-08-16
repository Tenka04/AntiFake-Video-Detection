import { Activity, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react';
import type { AnalysisResult } from '../../services/api';
import { cn } from '../../lib/utils';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const isAiGenerated = (result.ai_probability || 0) > 0.5;
  
  return (
    <div className="w-full bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none",
        isAiGenerated ? "bg-danger" : "bg-success"
      )}></div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Analysis Results
            {isAiGenerated ? (
              <span className="px-3 py-1 bg-danger/20 text-danger text-xs rounded-full border border-danger/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> AI Generated
              </span>
            ) : (
              <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full border border-success/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Likely Authentic
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Analysis ID: {result.id}</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" />
            {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score */}
        <div className="col-span-1 md:col-span-2 bg-black/40 rounded-xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
          <div className="flex items-end justify-between mb-2">
            <span className="text-gray-400 font-medium">AI Probability Score</span>
            <span className={cn(
              "text-4xl font-bold tracking-tight",
              isAiGenerated ? "text-danger" : "text-success"
            )}>
              {Math.round((result.ai_probability || 0) * 100)}%
            </span>
          </div>
          
          <div className="w-full h-3 bg-white/10 rounded-full mt-4 overflow-hidden flex relative">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out",
                isAiGenerated ? "bg-danger" : "bg-success"
              )} 
              style={{ width: `${(result.ai_probability || 0) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0% (Human)</span>
            <span>100% (AI)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-1 space-y-4">
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Confidence</div>
              <div className="text-lg font-semibold text-white">
                {Math.round((result.confidence || 0) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Cpu className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Model Version</div>
              <div className="text-sm font-medium text-white truncate w-24">
                {result.model_info || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
