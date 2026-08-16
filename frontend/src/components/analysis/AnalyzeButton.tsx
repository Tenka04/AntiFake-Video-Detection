import { Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function AnalyzeButton({ onClick, isAnalyzing, disabled }: AnalyzeButtonProps) {
  return (
    <div className="w-full flex flex-col items-center mt-8">
      <button
        onClick={onClick}
        disabled={disabled || isAnalyzing}
        className={cn(
          "relative group w-full md:w-auto overflow-hidden rounded-full font-semibold text-lg transition-all duration-300",
          disabled && !isAnalyzing
            ? "bg-surface text-gray-500 cursor-not-allowed border border-white/5"
            : "text-white glow-effect"
        )}
      >
        <div className={cn(
          "relative flex items-center justify-center gap-3 px-12 py-4 rounded-full transition-all duration-300 bg-surface",
          !disabled && !isAnalyzing && "bg-gradient-to-r from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary border border-white/20",
          isAnalyzing && "bg-primary/20 border border-primary/50"
        )}>
          {isAnalyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-6 h-6" />
              <span>Analyze Video</span>
            </>
          )}
        </div>
      </button>
      
      {!isAnalyzing && (
        <p className="text-xs text-gray-500 mt-4 max-w-sm text-center">
          AI Analysis API will be connected here. 
          <br/>Results shown are for demonstration purposes only.
        </p>
      )}
    </div>
  );
}
