// Nepal flag colors: Blue (#003893), Crimson (#DC143C), White (#FFFFFF)
export const colors = {
  // Primary colors based on Nepal flag
  primary: '#003893',      // Nepal blue
  secondary: '#DC143C',    // Nepal crimson
  accent: '#4A90E2',       // Lighter blue variant
  
  // Background and surface colors
  background: '#FFFFFF',   // Nepal white
  surface: '#F8F9FA',
  surfaceVariant: '#E3F2FD',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#FFFFFF',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // UI elements
  border: '#E0E0E0',
  divider: '#E0E0E0',
  disabled: '#BDBDBD',
  
  // Sports-specific colors
  sportsGreen: '#388E3C',  // For football/soccer
  sportsOrange: '#FF6F00', // For basketball
  
  // Nepal cultural accent colors
  nepalGold: '#FFD700',
  templeRed: '#B71C1C',
};

export const typography = {
  // Modern, catchy fonts for newer generation
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    light: 'Inter-Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};