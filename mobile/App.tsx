import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initErrorTracking } from './src/utils/errorTracking';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import {
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';

import {
  NotoNastaliqUrdu_400Regular,
} from '@expo-google-fonts/noto-nastaliq-urdu';

// Initialize global production error tracking
initErrorTracking();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
    NotoNastaliqUrdu: NotoNastaliqUrdu_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F6E5B" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
