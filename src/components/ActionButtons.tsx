import { Download, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface ActionButtonsProps {
  processedUrl: string;
  onReset: () => void;
}

export const ActionButtons = ({ processedUrl, onReset }: ActionButtonsProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = "background-removed.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
      <Button
        onClick={handleDownload}
        className="w-full sm:w-auto gradient-bg hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 rounded-xl transition-all duration-300 glow"
      >
        <Download className="w-5 h-5 mr-2" />
        Download Image
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full sm:w-auto px-8 py-6 rounded-xl border-2 hover:bg-accent transition-all duration-300"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Process Another
      </Button>
    </div>
  );
};
