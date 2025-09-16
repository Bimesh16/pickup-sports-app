import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { cn } from '@lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showBadge?: boolean;
  enableAutoSync?: boolean;
  onSyncComplete?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showBadge = true,
  enableAutoSync = true,
  onSyncComplete,
}) => {
  const { isOnline, effectiveType } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingActions, setPendingActions] = useState<number>(0);

  // Simulate pending actions from offline storage
  useEffect(() => {
    if (!isOnline) {
      // Simulate checking for pending actions
      const checkPendingActions = () => {
        const pending = localStorage.getItem('pendingActions');
        if (pending) {
          try {
            const actions = JSON.parse(pending);
            setPendingActions(actions.length);
          } catch (error) {
            console.error('Failed to parse pending actions:', error);
          }
        }
      };

      checkPendingActions();
      const interval = setInterval(checkPendingActions, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Auto-sync when back online
  useEffect(() => {
    if (isOnline && enableAutoSync && pendingActions > 0) {
      handleSync();
    }
  }, [isOnline, enableAutoSync, pendingActions]);

  const handleSync = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear pending actions
      localStorage.removeItem('pendingActions');
      setPendingActions(0);
      setLastSyncTime(new Date());
      setSyncStatus('success');

      onSyncComplete?.();

      // Reset success status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
  };

  const getStatusIcon = () => {
    const quality = getConnectionQuality();
    
    switch (quality) {
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'slow':
        return <Wifi className="w-4 h-4" />;
      case 'medium':
        return <Wifi className="w-4 h-4" />;
      case 'fast':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    const quality = getConnectionQuality();
    
    switch (quality) {
      case 'offline':
        return 'You\'re offline';
      case 'slow':
        return 'Slow connection';
      case 'medium':
        return '3G connection';
      case 'fast':
        return 'Connected';
      default:
        return 'Connected';
    }
  };

  const getStatusColor = () => {
    const quality = getConnectionQuality();
    
    switch (quality) {
      case 'offline':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'slow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fast':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!showBadge && isOnline) return null;

  return (
    <>
      {/* Mobile Badge */}
      <div
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300",
          "md:hidden", // Only show on mobile
          getStatusColor(),
          isOnline ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        role="status"
        aria-live="polite"
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {pendingActions > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingActions}
          </span>
        )}
      </div>

      {/* Desktop Indicator */}
      <div
        className={cn(
          "hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
          getStatusColor(),
          className
        )}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        
        {!isOnline && pendingActions > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {pendingActions} pending
            </span>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-1 hover:bg-red-100 rounded transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Sync pending actions"
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </button>
          </div>
        )}

        {isOnline && syncStatus === 'syncing' && (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-xs">Syncing...</span>
          </div>
        )}

        {isOnline && syncStatus === 'success' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">Synced</span>
          </div>
        )}

        {isOnline && syncStatus === 'error' && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600">Sync failed</span>
          </div>
        )}
      </div>

      {/* Sync Status Toast */}
      {syncStatus === 'success' && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
          <CheckCircle className="w-4 h-4" />
          <span>Data synced successfully!</span>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
          <AlertCircle className="w-4 h-4" />
          <span>Sync failed. Please try again.</span>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;