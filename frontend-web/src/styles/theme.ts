// src/styles/theme.ts - Nepal-Themed Design System

import { NEPAL_COLORS, TRADITIONAL_PATTERNS } from '@constants/nepal';

export const theme = {
  colors: NEPAL_COLORS,
  patterns: TRADITIONAL_PATTERNS,
  
  // Typography
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: 'Georgia, "Times New Roman", Times, serif',
    mono: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    nepali: '"Noto Sans Devanagari", "Mangal", "Devanagari Sangam MN", sans-serif'
  },

  // Spacing scale (in pixels)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
  },

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    nepal: `0 4px 20px rgba(220, 20, 60, 0.15)` // Crimson glow
  },

  // Gradients
  gradients: {
    primary: `linear-gradient(135deg, ${NEPAL_COLORS.primary} 0%, ${NEPAL_COLORS.secondary} 100%)`,
    sunset: `linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)`,
    mountain: `linear-gradient(180deg, #1B263B 0%, #003893 50%, #E63946 100%)`, // Navy → Royal → Crimson
    prayer: `linear-gradient(45deg, ${NEPAL_COLORS.primary}15 25%, transparent 25%, transparent 75%, ${NEPAL_COLORS.primary}15 75%)`,
    card: `linear-gradient(145deg, ${NEPAL_COLORS.surface} 0%, #f8fafc 100%)`
  },

  // Animations
  animations: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
    slideUp: 'slideUp 0.4s ease-out',
    bounce: 'bounce 1s infinite',
    pulse: 'pulse 2s infinite',
    prayer: 'prayer 3s ease-in-out infinite'
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px'
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  }
} as const;

// CSS-in-JS helper functions
export const createNepalCardStyle = (elevated = false) => ({
  background: theme.gradients.card,
  border: `1px solid #e5e7eb`,
  borderRadius: theme.radius.lg,
  boxShadow: elevated ? theme.shadows.nepal : theme.shadows.md,
  transition: 'all 0.2s ease-in-out',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: theme.gradients.primary,
    opacity: elevated ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out'
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.nepal,
    
    '&::before': {
      opacity: 1
    }
  }
});

export const createNepalButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    borderRadius: theme.radius.md,
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        background: theme.gradients.primary,
        color: 'white',
        boxShadow: theme.shadows.md,
        
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows.lg,
          filter: 'brightness(1.05)'
        },
        
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: theme.shadows.sm
        }
      };
      
    case 'secondary':
      return {
        ...baseStyle,
        background: theme.colors.surface,
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`,
        
        '&:hover': {
          background: theme.colors.primary,
          color: 'white',
          transform: 'translateY(-1px)'
        }
      };
      
    case 'outline':
      return {
        ...baseStyle,
        background: 'transparent',
        color: theme.colors.muted,
        border: `1px solid #e5e7eb`,
        
        '&:hover': {
          background: theme.colors.background,
          borderColor: theme.colors.primary,
          color: theme.colors.primary
        }
      };
      
    default:
      return baseStyle;
  }
};

export const createNepalInputStyle = () => ({
  width: '100%',
  padding: `${theme.spacing.sm + 2}px ${theme.spacing.md}px`,
  border: '1px solid #d1d5db',
  borderRadius: theme.radius.md,
  fontSize: '14px',
  color: theme.colors.text,
  fontWeight: '500',
  outline: 'none',
  transition: 'all 0.2s ease-in-out',
  background: theme.colors.surface,
  
  '&:focus': {
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primary}15`,
    background: 'white'
  },
  
  '&::placeholder': {
    color: theme.colors.muted,
    opacity: 0.8
  }
});

// Helper function to create responsive styles
export const responsive = {
  sm: (styles: Record<string, any>) => `@media (min-width: ${theme.breakpoints.sm}) { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ')} }`,
  md: (styles: Record<string, any>) => `@media (min-width: ${theme.breakpoints.md}) { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ')} }`,
  lg: (styles: Record<string, any>) => `@media (min-width: ${theme.breakpoints.lg}) { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ')} }`,
  xl: (styles: Record<string, any>) => `@media (min-width: ${theme.breakpoints.xl}) { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ')} }`
};

// CSS keyframes for animations
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes prayer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes mandala {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
`;

// Nepal-specific component styles
export const nepalComponents = {
  header: {
    background: theme.gradients.primary,
    color: 'white',
    padding: `${theme.spacing.md}px 0`,
    boxShadow: theme.shadows.md,
    position: 'sticky' as const,
    top: 0,
    zIndex: theme.zIndex.sticky
  },
  
  card: createNepalCardStyle(),
  cardElevated: createNepalCardStyle(true),
  
  button: {
    primary: createNepalButtonStyle('primary'),
    secondary: createNepalButtonStyle('secondary'),
    outline: createNepalButtonStyle('outline')
  },
  
  input: createNepalInputStyle(),
  
  modal: {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.modalBackdrop,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md
    },
    
    content: {
      background: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative' as const,
      zIndex: theme.zIndex.modal,
      animation: theme.animations.slideUp
    }
  },
  
  toast: {
    container: {
      position: 'fixed' as const,
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: theme.zIndex.toast,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: theme.spacing.sm
    },
    
    success: {
      background: `linear-gradient(135deg, ${theme.colors.success} 0%, #16a34a 100%)`,
      color: 'white',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      boxShadow: theme.shadows.lg,
      animation: theme.animations.slideUp
    },
    
    error: {
      background: `linear-gradient(135deg, ${theme.colors.error} 0%, #dc2626 100%)`,
      color: 'white',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      boxShadow: theme.shadows.lg,
      animation: theme.animations.slideUp
    },
    
    warning: {
      background: `linear-gradient(135deg, ${theme.colors.warning} 0%, #d97706 100%)`,
      color: 'white',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      boxShadow: theme.shadows.lg,
      animation: theme.animations.slideUp
    }
  }
};

export default theme;
