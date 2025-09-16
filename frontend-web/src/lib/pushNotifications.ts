import { apiClient } from './apiClient';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Check if we already have a subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Existing push subscription found');
        return true;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permission not granted for push notifications');
        return false;
      }

      // Subscribe to push notifications
      await this.subscribe();
      return true;

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      // Create subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80vIEW_z3upVhKQj4u7y0Z5ZP3yO2rGY3x2y8Zg'
        )
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      console.log('Push subscription created and sent to server');
      return this.subscription;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      if (result) {
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        console.log('Push subscription removed');
      }
      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      await apiClient.post('/api/v1/notifications/subscribe', subscriptionData);
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(): Promise<void> {
    try {
      if (this.subscription) {
        await apiClient.delete('/api/v1/notifications/subscribe', {
          data: { endpoint: this.subscription.endpoint }
        });
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    const defaultOptions: NotificationOptions = {
      body: options.body || '',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      data: options.data || {}
    };

    await this.registration.showNotification(title, { ...defaultOptions, ...options });
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const pushNotificationService = new PushNotificationService();
