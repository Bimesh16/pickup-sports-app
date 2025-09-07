import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, LOCALE_THEMES } from '../constants/theme';
import * as SecureStore from 'expo-secure-store';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  locale: 'nepal' | 'global';
  toggleTheme: () => void;
  setLocale: (locale: 'nepal' | 'global') => void;
  adaptiveMode: boolean;
  setAdaptiveMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [locale, setLocaleState] = useState<'nepal' | 'global'>('nepal');
  const [adaptiveMode, setAdaptiveModeState] = useState(true);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        const savedLocale = await SecureStore.getItemAsync('locale');
        const savedAdaptive = await SecureStore.getItemAsync('adaptiveMode');

        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        }
        if (savedLocale) {
          setLocaleState(savedLocale as 'nepal' | 'global');
        }
        if (savedAdaptive) {
          setAdaptiveModeState(savedAdaptive === 'true');
        }
      } catch (error) {
        console.log('Error loading theme preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Listen to system theme changes when adaptive mode is enabled
  useEffect(() => {
    if (adaptiveMode) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setIsDark(colorScheme === 'dark');
      });

      // Set initial system theme
      const colorScheme = Appearance.getColorScheme();
      setIsDark(colorScheme === 'dark');

      return () => subscription?.remove();
    }
  }, [adaptiveMode]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await SecureStore.setItemAsync('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const setLocale = async (newLocale: 'nepal' | 'global') => {
    setLocaleState(newLocale);
    try {
      await SecureStore.setItemAsync('locale', newLocale);
    } catch (error) {
      console.log('Error saving locale preference:', error);
    }
  };

  const setAdaptiveMode = async (enabled: boolean) => {
    setAdaptiveModeState(enabled);
    try {
      await SecureStore.setItemAsync('adaptiveMode', enabled.toString());
    } catch (error) {
      console.log('Error saving adaptive mode preference:', error);
    }

    if (enabled) {
      // When enabling adaptive mode, immediately apply system theme
      const colorScheme = Appearance.getColorScheme();
      setIsDark(colorScheme === 'dark');
    }
  };

  const currentTheme = LOCALE_THEMES[locale][isDark ? 'dark' : 'light'];

  const value: ThemeContextType = {
    theme: currentTheme,
    isDark,
    locale,
    toggleTheme,
    setLocale,
    adaptiveMode,
    setAdaptiveMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};