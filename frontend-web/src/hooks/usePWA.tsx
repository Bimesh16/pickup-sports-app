import { useEffect, useState } from 'react';
import { pushNotificationService } from '@lib/pushNotifications';
import { offlineCache } from '@lib/offlineCache';

export interface PWAStatus {
  isInstalled: boolean;
  canInstall: boolean;
  pushSupported: boolean;
  pushEnabled: boolean;
  offlineSupported: boolean;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    canInstall: false,
    pushSupported: false,
    pushEnabled: false,
    offlineSupported: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;

    // Check push notification support
    const pushSupported = pushNotificationService.isSupported();
    const pushEnabled = pushNotificationService.isSubscribed();

    // Check offline support
    const offlineSupported = 'serviceWorker' in navigator && 'indexedDB' in window;

    setStatus(prev => ({
      ...prev,
      isInstalled,
      pushSupported,
      pushEnabled,
      offlineSupported
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initialize PWA services
    const initializePWAServices = async () => {
      try {
        // Initialize offline cache
        if (offlineSupported) {
          await offlineCache.initialize();
        }

        // Initialize push notifications
        if (pushSupported) {
          await pushNotificationService.initialize();
          setStatus(prev => ({ 
            ...prev, 
            pushEnabled: pushNotificationService.isSubscribed() 
          }));
        }
      } catch (error) {
        console.error('Failed to initialize PWA services:', error);
      }
    };

    initializePWAServices();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  };

  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      const subscription = await pushNotificationService.subscribe();
      setStatus(prev => ({ ...prev, pushEnabled: !!subscription }));
      return !!subscription;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      return false;
    }
  };

  const disablePushNotifications = async (): Promise<boolean> => {
    try {
      const result = await pushNotificationService.unsubscribe();
      setStatus(prev => ({ ...prev, pushEnabled: !result }));
      return result;
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      return false;
    }
  };

  return {
    ...status,
    installApp,
    enablePushNotifications,
    disablePushNotifications
  };
};
