import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { getAdaptiveTheme, NepalTheme, NepalDarkTheme } from '@/constants/theme';

interface ThemeContextType {
  isDark: boolean;
  colors: any;
  theme: any;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  ambientLight: number | null;
  setAmbientLight: (light: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [ambientLight, setAmbientLight] = useState<number | null>(null);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, []);

  // Simulate ambient light detection (in a real app, you'd use expo-sensors)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate ambient light reading (0-1000 lux)
      const simulatedLight = Math.random() * 1000;
      setAmbientLight(simulatedLight);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  const theme = getAdaptiveTheme(isDark, ambientLight || undefined);
  const colors = isDark ? theme.colors : theme.colors;

  const value: ThemeContextType = {
    isDark,
    colors,
    theme,
    toggleTheme,
    setTheme,
    ambientLight,
    setAmbientLight,
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
