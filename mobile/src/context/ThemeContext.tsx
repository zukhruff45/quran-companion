import React, { createContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn } from 'react-native-reanimated';
import { lightTheme, darkTheme, ThemeType } from '../theme/theme';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setIsDarkMode(storedTheme === 'dark');
        } else {
          // Default to system preference if no stored theme
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.log('Failed to load theme preference', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      console.log('Failed to save theme preference', e);
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  if (!isLoaded) return null; // Wait for async storage

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDarkMode, toggleTheme }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Animated.View key={isDarkMode ? 'dark' : 'light'} entering={FadeIn.duration(300)} style={{ flex: 1 }}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
};
