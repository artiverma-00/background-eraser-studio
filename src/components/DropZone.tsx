import { Upload, Image as ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const DropZone = ({ onFileSelect, disabled }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    e.target.value = "";
  }, [onFileSelect]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative w-full min-h-[320px] rounded-2xl border-2 border-dashed 
        transition-all duration-300 cursor-pointer group
        ${isDragOver 
          ? "border-primary bg-accent/30 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-accent/10"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
        <div className={`
          relative p-6 rounded-2xl mb-6 transition-all duration-300
          ${isDragOver ? "gradient-bg scale-110" : "bg-accent group-hover:bg-primary/20"}
        `}>
          {isDragOver ? (
            <ImageIcon className="w-10 h-10 text-primary-foreground" />
          ) : (
            <Upload className="w-10 h-10 text-primary" />
          )}
          
          {/* Animated ring */}
          <div className={`
            absolute inset-0 rounded-2xl border-2 border-primary/30
            ${isDragOver ? "animate-ping" : "opacity-0 group-hover:opacity-100 group-hover:animate-pulse"}
          `} />
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isDragOver ? "Drop your image here" : "Drag & drop your image"}
        </h3>
        
        <p className="text-muted-foreground text-center mb-4">
          or click to browse from your device
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            JPG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            PNG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            WebP
          </span>
        </div>
      </div>
    </div>
  );
};
