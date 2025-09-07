// Web-compatible local authentication utility
import { Platform } from 'react-native';

// Mock implementation for web
const mockLocalAuth = {
  hasHardwareAsync: async () => false,
  isEnrolledAsync: async () => false,
  supportedAuthenticationTypesAsync: async () => [],
  authenticateAsync: async () => ({ success: false }),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
};

// Get the appropriate implementation
export const getLocalAuth = () => {
  if (Platform.OS === 'web') {
    return mockLocalAuth;
  }
  
  try {
    return require('expo-local-authentication');
  } catch (error) {
    console.log('expo-local-authentication not available, using mock:', error);
    return mockLocalAuth;
  }
};
