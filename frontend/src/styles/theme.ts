import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { DefaultTheme } from '@react-navigation/native';

// Nepal Flag Colors - Blue, Crimson (Red), White
export const NepalColors = {
  // Primary Colors - Nepal Flag Inspired
  primaryBlue: '#003893',      // Nepal Blue
  primaryCrimson: '#DC143C',   // Nepal Crimson
  primaryWhite: '#FFFFFF',     // Nepal White
  
  // Gradients and Variations
  lightBlue: '#4A90E2',
  darkBlue: '#002266',
  lightCrimson: '#FF4757',
  darkCrimson: '#AA1122',
  
  // Neutral Colors
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F7',
  outline: '#E1E5E9',
  outlineVariant: '#F1F4F8',
  
  // Text Colors
  onPrimary: '#FFFFFF',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#44474E',
  onBackground: '#1A1C1E',
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Futsal Green (Nepal specialty)
  futsalGreen: '#16A085',
  
  // Shadows and Overlays
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(255, 255, 255, 0.9)',
};

// Modern font configuration for younger generation
const fontConfig = {
  fontFamily: 'Poppins', // Catchy, modern font
  displayLarge: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 40,
  },
  displayMedium: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 36,
  },
  displaySmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 32,
  },
  headlineLarge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
  },
  headlineMedium: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 26,
  },
  headlineSmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 24,
  },
  titleLarge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleMedium: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  titleSmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
};

// Paper Theme Configuration
export const nepalTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: NepalColors.primaryCrimson,
    primaryContainer: NepalColors.lightCrimson,
    secondary: NepalColors.primaryBlue,
    secondaryContainer: NepalColors.lightBlue,
    tertiary: NepalColors.futsalGreen,
    surface: NepalColors.surface,
    surfaceVariant: NepalColors.surfaceVariant,
    background: NepalColors.background,
    error: NepalColors.error,
    onPrimary: NepalColors.onPrimary,
    onSurface: NepalColors.onSurface,
    onBackground: NepalColors.onBackground,
    outline: NepalColors.outline,
    outlineVariant: NepalColors.outlineVariant,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Navigation Theme
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: NepalColors.primaryCrimson,
    background: NepalColors.background,
    card: NepalColors.surface,
    text: NepalColors.onSurface,
    border: NepalColors.outline,
    notification: NepalColors.primaryCrimson,
  },
};

// Common styles for consistency
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: NepalColors.background,
  },
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 24,
  },
  shadows: {
    small: {
      shadowColor: NepalColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: NepalColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: NepalColors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default NepalColors;