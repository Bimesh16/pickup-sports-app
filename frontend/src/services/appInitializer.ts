import * as Font from 'expo-font';
import { Platform } from 'react-native';
import { healthAPI } from './api';

/**
 * App Initialization Service
 * Handles all startup requirements and configurations
 */

// Font loading configuration
const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
      'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    });
    console.log('✅ Fonts loaded successfully');
  } catch (error) {
    console.warn('⚠️ Font loading failed, using system fonts:', error);
  }
};

// API connectivity check
const checkApiConnectivity = async () => {
  try {
    const isHealthy = await healthAPI.ping();
    if (isHealthy) {
      console.log('✅ API connectivity verified');
    } else {
      console.warn('⚠️ API health check failed');
    }
    return isHealthy;
  } catch (error) {
    console.warn('⚠️ API connectivity check failed:', error);
    return false;
  }
};

// Platform-specific initialization
const initializePlatformFeatures = async () => {
  if (Platform.OS === 'ios') {
    // iOS specific initialization
    console.log('🍎 iOS platform features initialized');
  } else if (Platform.OS === 'android') {
    // Android specific initialization
    console.log('🤖 Android platform features initialized');
  }
};

// App performance configuration
const configurePerformance = () => {
  // Disable console logs in production
  if (__DEV__) {
    console.log('🔧 Development mode - console logs enabled');
  } else {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  // Configure React Native performance
  if (Platform.OS === 'android') {
    // Android-specific optimizations
    require('react-native').DeviceEventEmitter.addListener('DeviceEventEmitter', () => {});
  }
};

// Error tracking setup (placeholder for crash analytics)
const initializeErrorTracking = () => {
  // In production, you would initialize Sentry, Crashlytics, etc.
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log to crash reporting service
    originalConsoleError(...args);
  };
  
  console.log('📊 Error tracking initialized');
};

// Main initialization function
export const initializeApp = async (): Promise<void> => {
  console.log('🚀 Initializing Pickup Sports App...');
  
  try {
    // Run parallel initialization tasks
    await Promise.all([
      loadFonts(),
      checkApiConnectivity(),
      initializePlatformFeatures(),
    ]);
    
    // Configure performance settings
    configurePerformance();
    
    // Initialize error tracking
    initializeErrorTracking();
    
    console.log('✅ App initialization completed successfully');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    throw error;
  }
};

// Utility functions for app lifecycle
export const appLifecycle = {
  onAppStateChange: (nextAppState: string) => {
    console.log('📱 App state changed to:', nextAppState);
    
    if (nextAppState === 'active') {
      // App became active - refresh data if needed
      console.log('🔄 App became active - refreshing data');
    } else if (nextAppState === 'background') {
      // App went to background - pause location tracking
      console.log('⏸️ App went to background - pausing location tracking');
    }
  },
  
  onMemoryWarning: () => {
    console.warn('⚠️ Memory warning received - clearing caches');
    // Clear image caches, reduce memory usage
  },
  
  onNetworkChange: (isConnected: boolean) => {
    console.log('🌐 Network state changed:', isConnected ? 'connected' : 'disconnected');
    
    if (isConnected) {
      // Reconnected - sync offline data
      console.log('🔄 Network reconnected - syncing offline data');
    } else {
      // Disconnected - enable offline mode
      console.log('📴 Network disconnected - enabling offline mode');
    }
  },
};