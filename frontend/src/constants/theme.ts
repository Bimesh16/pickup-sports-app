// Nepal flag colors: Blue (#003893), Crimson (#DC143C), White (#FFFFFF)
// Enhanced with twilight purples and sunrise oranges
export const colors = {
  // Primary colors based on Nepal flag
  primary: '#003893',      // Nepal blue
  secondary: '#DC143C',    // Nepal crimson
  accent: '#4A90E2',       // Lighter blue variant
  
  // Twilight purple palette
  twilightPurple: '#6B46C1',    // Deep twilight purple
  twilightLight: '#8B5CF6',     // Light twilight purple
  twilightDark: '#4C1D95',      // Dark twilight purple
  
  // Sunrise orange palette
  sunriseOrange: '#F97316',     // Vibrant sunrise orange
  sunriseLight: '#FB923C',      // Light sunrise orange
  sunriseDark: '#EA580C',       // Dark sunrise orange
  
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
  
  // Glassmorphism colors
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassBlack: 'rgba(0, 0, 0, 0.1)',
  glassPrimary: 'rgba(0, 56, 147, 0.1)',
  glassSecondary: 'rgba(220, 20, 60, 0.1)',
};

// Dark mode colors
export const darkColors = {
  ...colors,
  // Dark mode overrides
  background: '#0A0A0A',        // Deep black
  surface: '#1A1A1A',          // Dark surface
  surfaceVariant: '#2A2A2A',   // Dark surface variant
  
  // Text colors for dark mode
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#FFFFFF',
  
  // UI elements for dark mode
  border: '#333333',
  divider: '#333333',
  disabled: '#555555',
  
  // Enhanced glassmorphism for dark mode
  glassWhite: 'rgba(255, 255, 255, 0.05)',
  glassBlack: 'rgba(0, 0, 0, 0.3)',
  glassPrimary: 'rgba(0, 56, 147, 0.2)',
  glassSecondary: 'rgba(220, 20, 60, 0.2)',
};

// Export as NepalColors for compatibility
export const NepalColors = colors;

export const typography = {
  // Modern, catchy fonts for newer generation
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    light: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
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

// Export as FontSizes for compatibility
export const FontSizes = typography.fontSize;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Export as Spacing for compatibility
export const Spacing = spacing;

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

// Export as Shadows for compatibility
export const Shadows = shadows;

// Export as BorderRadius for compatibility
export const BorderRadius = borderRadius;

// Create NepalTheme for React Native Paper
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const NepalTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    surface: colors.surface,
    background: colors.background,
    onSurface: colors.text,
    onBackground: colors.text,
    onPrimary: colors.textLight,
    onSecondary: colors.textLight,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
};

// Dark theme
export const NepalDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    surface: darkColors.surface,
    background: darkColors.background,
    onSurface: darkColors.text,
    onBackground: darkColors.text,
    onPrimary: darkColors.textLight,
    onSecondary: darkColors.textLight,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
};

// Common styles for reuse
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
};

// Cultural motifs and enhanced styles
export const culturalMotifs = {
  // Mandala patterns (simplified for React Native)
  mandala: {
    center: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.glassPrimary,
    },
    ring1: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 2,
      borderColor: colors.glassSecondary,
    },
    ring2: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: colors.glassPrimary,
    },
  },
  
  // Prayer flag patterns
  prayerFlag: {
    width: 20,
    height: 30,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
  
  // Himalayan gradient
  himalayanGradient: {
    colors: [colors.primary, colors.twilightPurple, colors.sunriseOrange],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Sunrise gradient
  sunriseGradient: {
    colors: [colors.sunriseOrange, colors.sunriseLight, colors.sunriseDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Twilight gradient
  twilightGradient: {
    colors: [colors.twilightPurple, colors.twilightLight, colors.twilightDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Enhanced glassmorphism styles
export const glassmorphismStyles = {
  light: {
    backgroundColor: colors.glassWhite,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dark: {
    backgroundColor: darkColors.glassWhite,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primary: {
    backgroundColor: colors.glassPrimary,
    borderWidth: 1,
    borderColor: 'rgba(0, 56, 147, 0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.glassSecondary,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Soft rounded edges for all UI elements
export const roundedStyles = {
  button: {
    borderRadius: borderRadius.xl,
  },
  card: {
    borderRadius: borderRadius.lg,
  },
  input: {
    borderRadius: borderRadius.lg,
  },
  modal: {
    borderRadius: borderRadius['2xl'],
  },
  chip: {
    borderRadius: borderRadius.full,
  },
};

// Micro-interaction styles
export const microInteractions = {
  pressable: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  hover: {
    transform: [{ scale: 1.02 }],
    opacity: 0.9,
  },
  focus: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  active: {
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
};

// Adaptive theme hook
export const getAdaptiveTheme = (isDark: boolean, ambientLight?: number) => {
  const baseTheme = isDark ? NepalDarkTheme : NepalTheme;
  const baseColors = isDark ? darkColors : colors;
  
  // Adjust theme based on ambient light
  if (ambientLight !== undefined) {
    const lightFactor = Math.min(ambientLight / 1000, 1); // Normalize to 0-1
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        // Adjust colors based on ambient light
        primary: lightFactor > 0.5 ? colors.primary : colors.twilightPurple,
        secondary: lightFactor > 0.5 ? colors.secondary : colors.sunriseOrange,
        background: lightFactor > 0.5 ? baseColors.background : darkColors.background,
      },
    };
  }
  
  return baseTheme;
};