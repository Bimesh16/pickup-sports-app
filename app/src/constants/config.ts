import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080'  // Development backend
    : 'https://api.pickupsports.com.np', // Production backend
  TIMEOUT: 30000, // 30 seconds
  
  // WebSocket Configuration
  WS_URL: __DEV__
    ? 'ws://localhost:8080/ws'
    : 'wss://api.pickupsports.com.np/ws',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Pickup Sports Nepal',
  VERSION: Constants.expoConfig?.version || '1.0.0',
  
  // Feature Flags
  FEATURES: {
    ENABLE_LOCATION: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_CHAT: true,
    ENABLE_PAYMENTS: true,
    ENABLE_AI_RECOMMENDATIONS: true,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'pickup_sports_token',
    REFRESH_TOKEN: 'pickup_sports_refresh_token',
    USER_DATA: 'pickup_sports_user',
    SETTINGS: 'pickup_sports_settings',
    LOCATION: 'pickup_sports_location',
  },
  
  // Map Configuration
  MAP: {
    INITIAL_REGION: {
      latitude: 27.7172, // Kathmandu, Nepal
      longitude: 85.3240,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
    SEARCH_RADIUS: 25, // 25km radius
  },
  
  // Nepal Payment Providers
  PAYMENT_PROVIDERS: {
    ESEWA: {
      name: 'eSewa',
      icon: 'esewa',
      enabled: true,
    },
    KHALTI: {
      name: 'Khalti',
      icon: 'khalti', 
      enabled: true,
    },
  },
  
  // Sports Configuration
  SPORTS: {
    FUTSAL: {
      name: 'Futsal',
      nameNepali: 'फुटसल',
      icon: 'soccer',
      popular: true,
    },
    FOOTBALL: {
      name: 'Football',
      nameNepali: 'फुटबल',
      icon: 'football',
      popular: true,
    },
    BASKETBALL: {
      name: 'Basketball', 
      nameNepali: 'बास्केटबल',
      icon: 'basketball',
      popular: false,
    },
    CRICKET: {
      name: 'Cricket',
      nameNepali: 'क्रिकेट',
      icon: 'cricket',
      popular: false,
    },
  },
  
  // Skill Levels
  SKILL_LEVELS: {
    BEGINNER: {
      name: 'Beginner',
      nameNepali: 'शुरुवाती',
      level: 1,
    },
    INTERMEDIATE: {
      name: 'Intermediate', 
      nameNepali: 'मध्यम',
      level: 2,
    },
    ADVANCED: {
      name: 'Advanced',
      nameNepali: 'उन्नत',
      level: 3,
    },
  },
  
  // Popular Areas in Kathmandu
  POPULAR_AREAS: [
    'Thamel',
    'Lazimpat', 
    'New Baneshwor',
    'Pulchowk',
    'Dillibazar',
    'Maharajgunj',
    'Baluwatar',
    'Kupandole',
  ],
};

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-zA-Z])(?=.*\d)/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^(\+977)?[0-9]{10}$/,
  },
};