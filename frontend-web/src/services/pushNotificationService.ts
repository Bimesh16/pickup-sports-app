import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPermission {
  permission: NotificationPermission;
  isSupported: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current notification permission
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission has been denied. Push notifications will not work.');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push messaging is not supported');
    }

    try {
      // Check if we already have a subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return this.subscription;
      }

      // Create new subscription
      const applicationServerKey = this.urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI0QYfzJ1N5k4g'
      );

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('Subscribed to push notifications:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await apiClient.post('/api/v1/notifications/subscribe', {
        subscription: subscription,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    if (!this.subscription) {
      console.log('No subscription to unsubscribe from');
      return;
    }

    try {
      const success = await this.subscription.unsubscribe();
      if (success) {
        console.log('Successfully unsubscribed from push notifications');
        this.subscription = null;
        
        // Notify server about unsubscription
        await apiClient.delete('/api/v1/notifications/unsubscribe');
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      // Check if supported
      if (!this.isSupported()) {
        console.log('Push notifications are not supported');
        return false;
      }

      // Request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted:', permission);
        return false;
      }

      // Register service worker
      await this.registerServiceWorker();

      // Subscribe to push notifications
      const subscription = await this.subscribeToPush();

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      console.log('Push notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Update subscription on server
  async updateSubscription(): Promise<void> {
    if (!this.subscription) {
      throw new Error('No subscription to update');
    }

    try {
      await apiClient.put('/api/v1/notifications/subscribe', {
        subscription: this.subscription,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      console.log('Subscription updated on server');
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  // Show local notification
  showLocalNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Handle notification click
  handleNotificationClick(notification: Notification): void {
    notification.close();
    
    // Focus the app window
    window.focus();
    
    // Navigate to relevant page if needed
    const data = notification.data;
    if (data && data.url) {
      window.location.href = data.url;
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get subscription status
  getSubscriptionStatus(): {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    hasServiceWorker: boolean;
  } {
    return {
      isSupported: this.isSupported(),
      permission: this.getPermission(),
      isSubscribed: this.subscription !== null,
      hasServiceWorker: this.registration !== null
    };
  }

  // Test push notification
  async testPushNotification(): Promise<void> {
    try {
      await apiClient.post('/api/v1/notifications/test', {
        title: 'Test Notification',
        body: 'This is a test push notification from Pickup Sports!',
        icon: '/favicon.ico'
      });
      
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Export the class for testing
export { PushNotificationService };
