// Nepal Flag Colors Theme - Modern & Catchy for Younger Generation
export const colors = {
  // Primary Nepal Colors
  primary: '#DC143C',      // Nepal Crimson Red
  secondary: '#003893',    // Nepal Blue 
  accent: '#FFFFFF',       // Pure White
  
  // Background Colors
  background: '#FAFAFA',   // Light gray background
  surface: '#FFFFFF',      // White surface
  surfaceVariant: '#F5F5F5', // Light surface variant
  
  // Text Colors
  text: '#1A1A1A',         // Dark text
  textSecondary: '#666666', // Secondary text
  textLight: '#999999',    // Light text
  onPrimary: '#FFFFFF',    // White on primary
  onSecondary: '#FFFFFF',  // White on secondary
  
  // Utility Colors
  success: '#10B981',      // Green success
  warning: '#F59E0B',      // Amber warning
  error: '#EF4444',        // Red error
  info: '#3B82F6',         // Blue info
  
  // Border & Divider
  border: '#E5E5E5',       // Light border
  divider: '#EEEEEE',      // Divider line
  
  // Interactive States
  hover: 'rgba(220, 20, 60, 0.1)',    // Primary hover
  pressed: 'rgba(220, 20, 60, 0.2)',  // Primary pressed
  disabled: '#CCCCCC',                 // Disabled state
  placeholder: '#AAAAAA',              // Placeholder text
  
  // Gradients
  primaryGradient: ['#DC143C', '#B91C5C'], // Crimson gradient
  secondaryGradient: ['#003893', '#1E40AF'], // Blue gradient
  neutralGradient: ['#F8FAFC', '#E2E8F0'], // Neutral gradient
};

export const typography = {
  // Font Family - Modern & Catchy
  fontFamily: {
    primary: 'Inter',
    secondary: 'Poppins',
    mono: 'JetBrains Mono',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14, 
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};