import { Appearance } from 'react-native';

export const NEPAL_COLORS = {
  // Nepal flag colors
  NEPAL_RED: '#DC143C',
  NEPAL_BLUE: '#003893',
  NEPAL_WHITE: '#FFFFFF',
};

export const GLOBAL_COLORS = {
  // Global primary
  GLOBAL_BLUE: '#2563EB',
  SECONDARY_GREEN: '#10B981',
  
  // Neutrals
  WHITE: '#FFFFFF',
  LIGHT_GREY: '#F8FAFC',
  MEDIUM_GREY: '#64748B',
  DARK_TEXT: '#1E293B',
  BLACK: '#000000',
  
  // Accent gradients
  TWILIGHT_PURPLE: '#5B2C6F',
  SUNRISE_ORANGE: '#FF7F50',
  
  // Additional colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64,
};

export const BORDER_RADIUS = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  PILL: 999,
};

export const TYPOGRAPHY = {
  HEADING: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  SUBHEADING: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  BODY: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  BODY_SMALL: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  CAPTION: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
};

export const SHADOWS = {
  LIGHT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  HEAVY: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const GLASSMORPHISM = {
  LIGHT: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  MEDIUM: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(15px)',
  },
  DARK: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
};

// Theme interfaces
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  typography: typeof TYPOGRAPHY;
  shadows: typeof SHADOWS;
  glassmorphism: typeof GLASSMORPHISM;
}

// Light Theme
export const LIGHT_THEME: Theme = {
  colors: {
    primary: NEPAL_COLORS.NEPAL_RED,
    secondary: GLOBAL_COLORS.SECONDARY_GREEN,
    accent: GLOBAL_COLORS.TWILIGHT_PURPLE,
    background: GLOBAL_COLORS.WHITE,
    surface: GLOBAL_COLORS.LIGHT_GREY,
    card: GLOBAL_COLORS.WHITE,
    text: GLOBAL_COLORS.DARK_TEXT,
    textSecondary: GLOBAL_COLORS.MEDIUM_GREY,
    border: '#E2E8F0',
    error: GLOBAL_COLORS.ERROR,
    success: GLOBAL_COLORS.SUCCESS,
    warning: GLOBAL_COLORS.WARNING,
    info: GLOBAL_COLORS.INFO,
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  glassmorphism: GLASSMORPHISM,
};

// Dark Theme
export const DARK_THEME: Theme = {
  colors: {
    primary: NEPAL_COLORS.NEPAL_RED,
    secondary: GLOBAL_COLORS.SECONDARY_GREEN,
    accent: GLOBAL_COLORS.SUNRISE_ORANGE,
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    text: GLOBAL_COLORS.WHITE,
    textSecondary: '#94A3B8',
    border: '#475569',
    error: GLOBAL_COLORS.ERROR,
    success: GLOBAL_COLORS.SUCCESS,
    warning: GLOBAL_COLORS.WARNING,
    info: GLOBAL_COLORS.INFO,
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  glassmorphism: GLASSMORPHISM,
};

// Locale-based themes
export const LOCALE_THEMES = {
  nepal: {
    light: {
      ...LIGHT_THEME,
      colors: {
        ...LIGHT_THEME.colors,
        primary: NEPAL_COLORS.NEPAL_RED,
        accent: NEPAL_COLORS.NEPAL_BLUE,
      },
    },
    dark: {
      ...DARK_THEME,
      colors: {
        ...DARK_THEME.colors,
        primary: NEPAL_COLORS.NEPAL_RED,
        accent: NEPAL_COLORS.NEPAL_BLUE,
      },
    },
  },
  global: {
    light: {
      ...LIGHT_THEME,
      colors: {
        ...LIGHT_THEME.colors,
        primary: GLOBAL_COLORS.GLOBAL_BLUE,
        accent: GLOBAL_COLORS.TWILIGHT_PURPLE,
      },
    },
    dark: {
      ...DARK_THEME,
      colors: {
        ...DARK_THEME.colors,
        primary: GLOBAL_COLORS.GLOBAL_BLUE,
        accent: GLOBAL_COLORS.SUNRISE_ORANGE,
      },
    },
  },
};

// Animation constants
export const ANIMATIONS = {
  TIMING: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    SPRING: 'spring',
  },
};

// Mandala/Prayer flag decorative constants
export const DECORATIVE = {
  MANDALA_OPACITY: 0.05,
  PRAYER_FLAG_COLORS: ['#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FFFFFF'],
  GRADIENTS: {
    NEPAL_SUNSET: ['#DC143C', '#5B2C6F', '#FF7F50'],
    GLOBAL_OCEAN: ['#2563EB', '#0EA5E9', '#06B6D4'],
    SUCCESS_GRADIENT: ['#10B981', '#34D399'],
    WARNING_GRADIENT: ['#F59E0B', '#FBBF24'],
  },
};

export default LIGHT_THEME;