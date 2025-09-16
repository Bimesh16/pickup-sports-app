import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: null
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    const checkConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus(prev => ({
          ...prev,
          isSlowConnection: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g',
          connectionType: connection.effectiveType || connection.type
        }));
      }
    };

    // Initial check
    updateNetworkStatus();
    checkConnectionType();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', checkConnectionType);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', checkConnectionType);
      }
    };
  }, []);

  return networkStatus;
};
