import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enableBackdropClose?: boolean;
  enableSwipeClose?: boolean;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  side = 'right',
  size = 'md',
  enableBackdropClose = true,
  enableSwipeClose = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[28rem]',
    xl: 'w-[32rem]',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeClose) return;
    
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !enableSwipeClose) return;
    
    e.preventDefault();
    currentXRef.current = e.touches[0].clientX;
    
    const deltaX = currentXRef.current - startXRef.current;
    const drawer = drawerRef.current;
    
    if (drawer) {
      if (side === 'right') {
        // Swipe left to close
        if (deltaX < 0) {
          drawer.style.transform = `translateX(${Math.max(deltaX, -drawer.offsetWidth)}px)`;
        }
      } else {
        // Swipe right to close
        if (deltaX > 0) {
          drawer.style.transform = `translateX(${Math.min(deltaX, drawer.offsetWidth)}px)`;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || !enableSwipeClose) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const drawer = drawerRef.current;
    const threshold = drawer ? drawer.offsetWidth * 0.3 : 100;
    
    if (drawer) {
      drawer.style.transform = '';
      
      if (side === 'right' && deltaX < -threshold) {
        onClose();
      } else if (side === 'left' && deltaX > threshold) {
        onClose();
      }
    }
    
    isDraggingRef.current = false;
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
      className="fixed inset-0 z-50 flex"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "relative bg-[var(--bg-surface)] shadow-2xl h-full flex flex-col",
          "transform transition-transform duration-300 ease-out",
          side === 'right' ? 'ml-auto' : 'mr-auto',
          sizeClasses[size],
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {title}
            </h3>
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

export default MobileDrawer;
