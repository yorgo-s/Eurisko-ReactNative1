import React, {createContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

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

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
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

  return (
    <ThemeContext.Provider value={{theme, isDarkMode, toggleTheme, colors}}>
      {children}
    </ThemeContext.Provider>
  );
};
