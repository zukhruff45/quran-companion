import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

import IslamicPattern from '../components/svg/IslamicPattern';

const Splash = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <IslamicPattern opacity={0.15} />
      <Text style={[styles.title, { fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1 }]}>
        Quran Companion
      </Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: theme.spacing.xl }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
  },
});

export default Splash;
