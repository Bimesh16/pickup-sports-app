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

// Export as NepalColors for compatibility
export const NepalColors = colors;

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
import { MD3LightTheme } from 'react-native-paper';

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
      fontFamily: typography.fontFamily.regular,
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: typography.fontFamily.medium,
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: typography.fontFamily.bold,
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