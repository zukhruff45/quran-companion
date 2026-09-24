import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Button from '../components/ui/Button';

import IslamicPattern from '../components/svg/IslamicPattern';

const Onboarding = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  
  // Using the custom generated splash image from Gemini
  const bgImage = require('../../assets/splash.jpg');

  return (
    <ImageBackground 
      source={bgImage} 
      style={styles.container} 
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'cover' }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dark overlay for text readability */}
      <View style={styles.overlay}>
        <IslamicPattern opacity={0.15} />
        <View style={[styles.content, { marginTop: theme.spacing.xxxl }]}>
          <Text style={[styles.title, { fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.display }]}>Quran Companion</Text>
          <Text style={[styles.subtitle, { fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.h3 }]}>
            Read, listen, and learn the Holy Quran anytime, anywhere. Your digital spiritual guide.
          </Text>
        </View>
        
        <View style={[styles.footer, { paddingBottom: theme.spacing.xxxl }]}>
          <Button 
            title="Get Started"
            variant="primary"
            style={{ borderRadius: theme.borderRadius.full, paddingVertical: 18, ...theme.shadows.medium }}
            textStyle={{ fontSize: theme.typography.size.h3 }}
            onPress={() => navigation.replace('Login')}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  footer: {
    padding: 25,
  },
  button: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
  },
});

export default Onboarding;
