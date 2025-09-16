import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@lib/utils';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  snapPoints?: number[];
  defaultSnapPoint?: number;
  enableDrag?: boolean;
  enableBackdropClose?: boolean;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  snapPoints = [0.25, 0.5, 0.9],
  defaultSnapPoint = 0.5,
  enableDrag = true,
  enableBackdropClose = true,
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const getSnapPointHeight = (snapPoint: number) => {
    return `${snapPoint * 100}%`;
  };

  const findClosestSnapPoint = (y: number) => {
    const sheetHeight = window.innerHeight;
    const relativeY = y / sheetHeight;
    
    return snapPoints.reduce((closest, point) => {
      return Math.abs(point - relativeY) < Math.abs(closest - relativeY) ? point : closest;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableDrag) return;
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !enableDrag) return;
    
    e.preventDefault();
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !enableDrag) return;
    
    const deltaY = currentY - startY;
    const sheetHeight = window.innerHeight;
    const currentHeight = sheetHeight * currentSnapPoint;
    const newHeight = currentHeight + deltaY;
    const newSnapPoint = newHeight / sheetHeight;
    
    // Find closest snap point
    const closestSnapPoint = findClosestSnapPoint(newHeight);
    
    // If dragged down significantly, close the sheet
    if (deltaY > 100 && closestSnapPoint === snapPoints[0]) {
      onClose();
    } else {
      setCurrentSnapPoint(closestSnapPoint);
    }
    
    setIsDragging(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (enableBackdropClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "relative bg-[var(--bg-surface)] rounded-t-2xl shadow-2xl w-full max-h-[90vh]",
          "transform transition-transform duration-300 ease-out",
          isDragging ? "transition-none" : "",
          className
        )}
        style={{
          height: getSnapPointHeight(currentSnapPoint),
          transform: isDragging 
            ? `translateY(${Math.max(0, currentY - startY)}px)`
            : 'translateY(0)',
        }}
      >
        {/* Drag Handle */}
        {enableDrag && (
          <div
            ref={dragHandleRef}
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1 bg-[var(--text-muted)] rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || enableDrag) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            {title && (
              <h3 className="text-lg font-semibold text-[var(--text)]">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomSheet;
