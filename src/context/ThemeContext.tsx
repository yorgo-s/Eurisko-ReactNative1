// src/context/ThemeContext.tsx
import React, {createContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFont, FontWeight, fontSize} from '../utils/fontUtils';
import {TextStyle} from 'react-native';

type ThemeType = 'light' | 'dark';

// Define a more comprehensive typography system that integrates with theming
type TypographyStyles = {
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  bodyBold: TextStyle;
  caption: TextStyle;
  button: TextStyle;
  label: TextStyle;
};

type ThemeContextType = {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    card: string;
    primary: string;
    secondary: string;
    border: string;
    error: string;
  };
  typography: TypographyStyles;
  // Helper function to get font style for current theme
  getFontStyle: (weight: FontWeight, size: number) => TextStyle;
};

const lightColors = {
  background: '#FFFFFF',
  text: '#121212',
  card: '#F5F5F5',
  primary: '#6200ee',
  secondary: '#03dac6',
  border: '#E0E0E0',
  error: '#B00020',
};

const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  card: '#1E1E1E',
  primary: '#BB86FC',
  secondary: '#03DAC5',
  border: '#2C2C2C',
  error: '#CF6679',
};

// Helper to create typography styles that automatically pick up theme colors
const createTypography = (colors: typeof lightColors): TypographyStyles => ({
  heading1: {
    ...getFont('bold', fontSize.title),
    lineHeight: fontSize.title * 1.3,
    color: colors.text,
  },
  heading2: {
    ...getFont('bold', fontSize.heading),
    lineHeight: fontSize.heading * 1.3,
    color: colors.text,
  },
  heading3: {
    ...getFont('semiBold', fontSize.xxxl),
    lineHeight: fontSize.xxxl * 1.3,
    color: colors.text,
  },
  subtitle: {
    ...getFont('semiBold', fontSize.lg),
    lineHeight: fontSize.lg * 1.5,
    color: colors.text,
  },
  body: {
    ...getFont('regular', fontSize.md),
    lineHeight: fontSize.md * 1.5,
    color: colors.text,
  },
  bodyBold: {
    ...getFont('semiBold', fontSize.md),
    lineHeight: fontSize.md * 1.5,
    color: colors.text,
  },
  caption: {
    ...getFont('regular', fontSize.sm),
    lineHeight: fontSize.sm * 1.5,
    color: colors.text,
  },
  button: {
    ...getFont('semiBold', fontSize.md),
    color: colors.text,
  },
  label: {
    ...getFont('medium', fontSize.md),
    color: colors.text,
  },
});

// Initial context values
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
  typography: createTypography(lightColors),
  getFontStyle: (weight, size) => getFont(weight, size),
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Load theme preference from storage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else if (deviceTheme) {
          // Use device theme as default if no saved preference
          setTheme(deviceTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const isDarkMode = theme === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  const typography = createTypography(colors);

  // Custom function to get font with current theme's text color
  const getFontStyle = (weight: FontWeight, size: number): TextStyle => {
    return {
      ...getFont(weight, size),
      color: colors.text,
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        colors,
        typography,
        getFontStyle,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
