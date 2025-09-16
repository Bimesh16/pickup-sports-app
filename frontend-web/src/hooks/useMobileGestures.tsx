import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface GestureConfig {
  swipeThreshold: number;
  pullToRefreshThreshold: number;
  tabBarHeight: number;
}

const defaultConfig: GestureConfig = {
  swipeThreshold: 50,
  pullToRefreshThreshold: 80,
  tabBarHeight: 60,
};

export const useMobileGestures = (
  config: Partial<GestureConfig> = {},
  onRefresh?: () => void
) => {
  const navigate = useNavigate();
  const gestureConfig = { ...defaultConfig, ...config };
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const isRefreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  // Tab navigation order
  const tabOrder = [
    '/dashboard',
    '/dashboard/games',
    '/dashboard/venues',
    '/dashboard/profile',
    '/dashboard/notifications',
    '/dashboard/settings'
  ];

  const getCurrentTabIndex = (pathname: string): number => {
    return tabOrder.findIndex(tab => pathname.startsWith(tab));
  };

  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    const currentPath = window.location.pathname;
    const currentIndex = getCurrentTabIndex(currentPath);
    
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'left') {
      newIndex = currentIndex + 1;
      if (newIndex >= tabOrder.length) newIndex = 0;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = tabOrder.length - 1;
    }

    navigate(tabOrder[newIndex]);
  }, [navigate]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchMoveRef.current = null;
    pullDistanceRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Handle pull-to-refresh
    if (window.scrollY === 0 && deltaY > 0 && Math.abs(deltaX) < Math.abs(deltaY)) {
      e.preventDefault();
      pullDistanceRef.current = Math.min(deltaY, gestureConfig.pullToRefreshThreshold * 1.5);
      
      // Visual feedback for pull-to-refresh
      const pullIndicator = document.getElementById('pull-to-refresh-indicator');
      if (pullIndicator) {
        const progress = pullDistanceRef.current / gestureConfig.pullToRefreshThreshold;
        pullIndicator.style.transform = `translateY(${pullDistanceRef.current * 0.5}px)`;
        pullIndicator.style.opacity = Math.min(progress, 1).toString();
      }
    }
  }, [gestureConfig.pullToRefreshThreshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaY = touchMoveRef.current.y - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Reset pull-to-refresh visual feedback
    const pullIndicator = document.getElementById('pull-to-refresh-indicator');
    if (pullIndicator) {
      pullIndicator.style.transform = 'translateY(0)';
      pullIndicator.style.opacity = '0';
    }

    // Handle swipe gestures (only if not pulling to refresh)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > gestureConfig.swipeThreshold) {
      const isQuickSwipe = deltaTime < 300;
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2;

      if (isQuickSwipe && isHorizontalSwipe) {
        if (deltaX > 0) {
          // Swipe right - go to previous tab
          navigateToTab('right');
        } else {
          // Swipe left - go to next tab
          navigateToTab('left');
        }
      }
    }

    // Handle pull-to-refresh
    if (window.scrollY === 0 && deltaY > gestureConfig.pullToRefreshThreshold && !isRefreshingRef.current) {
      isRefreshingRef.current = true;
      onRefresh?.();
      
      // Reset refreshing state after a delay
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 2000);
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
    pullDistanceRef.current = 0;
  }, [gestureConfig.swipeThreshold, gestureConfig.pullToRefreshThreshold, navigateToTab, onRefresh]);

  useEffect(() => {
    // Only add gesture support on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing: isRefreshingRef.current,
    pullDistance: pullDistanceRef.current
  };
};
