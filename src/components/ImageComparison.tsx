import { useState, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface ImageComparisonProps {
  originalSrc: string;
  processedSrc: string;
}

export const ImageComparison = ({ originalSrc, processedSrc }: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      updateSliderPosition(e.clientX);
    }
  }, [updateSliderPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    updateSliderPosition(e.touches[0].clientX);
  }, [updateSliderPosition]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize glass animate-scale-in"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {/* Checkered background for transparency */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />

      {/* Processed image (background removed) */}
      <img
        src={processedSrc}
        alt="Background removed"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Original image with clip */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={originalSrc}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Slider */}
      <div
        className="absolute top-0 bottom-0 w-1 gradient-bg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-lg glow">
          <GripVertical className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full glass text-sm font-medium">
        Original
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full glass text-sm font-medium">
        Removed
      </div>
    </div>
  );
};
