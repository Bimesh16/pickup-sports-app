import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface SystemDarkModeConfig {
  defaultTheme: Theme;
  enableSystemDetection: boolean;
  enableTransition: boolean;
  transitionDuration: number;
}

const defaultConfig: SystemDarkModeConfig = {
  defaultTheme: 'system',
  enableSystemDetection: true,
  enableTransition: true,
  transitionDuration: 300,
};

export const useSystemDarkMode = (config: Partial<SystemDarkModeConfig> = {}) => {
  const handlerConfig = { ...defaultConfig, ...config };
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || handlerConfig.defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get the effective theme (resolves 'system' to actual theme)
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Detect system theme
  const detectSystemTheme = useCallback(() => {
    if (!handlerConfig.enableSystemDetection) return 'light';

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }

    return 'light';
  }, [handlerConfig.enableSystemDetection]);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (handlerConfig.enableTransition) {
      setIsTransitioning(true);
    }

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Set data attribute for CSS
    root.setAttribute('data-theme', newTheme);
    
    // Set meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = newTheme === 'dark' ? '#1a1a1a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }

    // Set CSS custom properties for theme colors
    const themeColors = {
      light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f9fa',
        '--bg-surface': '#ffffff',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#6b7280',
        '--border-color': '#e5e7eb',
      },
      dark: {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#2d2d2d',
        '--bg-surface': '#2d2d2d',
        '--text-primary': '#ffffff',
        '--text-secondary': '#9ca3af',
        '--border-color': '#374151',
      },
    };

    const colors = themeColors[newTheme];
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    if (handlerConfig.enableTransition) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, handlerConfig.transitionDuration);
    }
  }, [handlerConfig.enableTransition, handlerConfig.transitionDuration]);

  // Handle system theme change
  const handleSystemThemeChange = useCallback((e: MediaQueryListEvent) => {
    const newSystemTheme = e.matches ? 'dark' : 'light';
    setSystemTheme(newSystemTheme);
    
    // Only apply if current theme is 'system'
    if (theme === 'system') {
      applyTheme(newSystemTheme);
    }
  }, [theme, applyTheme]);

  // Set theme
  const setThemeMode = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      applyTheme(systemTheme);
    } else {
      applyTheme(newTheme);
    }
  }, [systemTheme, applyTheme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
  }, [effectiveTheme, setThemeMode]);

  // Initialize theme
  useEffect(() => {
    // Detect initial system theme
    const initialSystemTheme = detectSystemTheme();
    setSystemTheme(initialSystemTheme);

    // Apply initial theme
    if (theme === 'system') {
      applyTheme(initialSystemTheme);
    } else {
      applyTheme(theme);
    }

    // Listen for system theme changes
    if (handlerConfig.enableSystemDetection && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme, detectSystemTheme, applyTheme, handleSystemThemeChange, handlerConfig.enableSystemDetection]);

  // Handle visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && theme === 'system') {
        const currentSystemTheme = detectSystemTheme();
        if (currentSystemTheme !== systemTheme) {
          setSystemTheme(currentSystemTheme);
          applyTheme(currentSystemTheme);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme, systemTheme, detectSystemTheme, applyTheme]);

  // Get theme display name
  const getThemeDisplayName = useCallback(() => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return `System (${systemTheme})`;
      default:
        return 'System';
    }
  }, [theme, systemTheme]);

  // Check if theme is system
  const isSystemTheme = theme === 'system';

  // Check if current theme is dark
  const isDark = effectiveTheme === 'dark';

  // Check if current theme is light
  const isLight = effectiveTheme === 'light';

  return {
    theme,
    effectiveTheme,
    systemTheme,
    isDark,
    isLight,
    isSystemTheme,
    isTransitioning,
    setTheme: setThemeMode,
    toggleTheme,
    getThemeDisplayName,
  };
};
