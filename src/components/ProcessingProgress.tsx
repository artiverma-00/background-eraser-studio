import { Loader2 } from "lucide-react";

interface ProcessingProgressProps {
  progress: number;
  status: string;
}

export const ProcessingProgress = ({ progress, status }: ProcessingProgressProps) => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              className="transition-all duration-500 ease-out"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))"
              }}
            />
          </svg>
          
          {/* Center spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>

        <div className="mb-4">
          <span className="text-3xl font-bold gradient-text">{progress}%</span>
        </div>

        <p className="text-muted-foreground font-medium">{status}</p>

        {/* Progress bar */}
        <div className="mt-6 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-bg transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};
