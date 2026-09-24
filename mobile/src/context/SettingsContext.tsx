import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({ children }: any) => {
  const [translation, setTranslation] = useState('en.asad');
  const [urduTranslation, setUrduTranslation] = useState('ur.jalandhry');
  const [translationMode, setTranslationMode] = useState('English'); // 'English', 'Urdu', 'Both'
  const [reciter, setReciter] = useState('ar.alafasy');
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [language, setLanguage] = useState('en');
  const [tafsirId, setTafsirId] = useState(169); // Default to Ibn Kathir

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.translation) setTranslation(parsed.translation);
        if (parsed.urduTranslation) setUrduTranslation(parsed.urduTranslation);
        if (parsed.translationMode) setTranslationMode(parsed.translationMode);
        if (parsed.reciter) setReciter(parsed.reciter);
        if (parsed.audioSpeed) setAudioSpeed(parsed.audioSpeed);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.tafsirId) setTafsirId(parsed.tafsirId);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const current = { translation, urduTranslation, translationMode, reciter, audioSpeed, language, tafsirId };
      const merged = { ...current, ...newSettings };
      await AsyncStorage.setItem('app_settings', JSON.stringify(merged));
      if (newSettings.translation) setTranslation(newSettings.translation);
      if (newSettings.urduTranslation) setUrduTranslation(newSettings.urduTranslation);
      if (newSettings.translationMode) setTranslationMode(newSettings.translationMode);
      if (newSettings.reciter) setReciter(newSettings.reciter);
      if (newSettings.audioSpeed) setAudioSpeed(newSettings.audioSpeed);
      if (newSettings.language) setLanguage(newSettings.language);
      if (newSettings.tafsirId) setTafsirId(newSettings.tafsirId);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  return (
    <SettingsContext.Provider value={{
      translation,
      urduTranslation,
      translationMode,
      reciter,
      audioSpeed,
      language,
      tafsirId,
      updateSettings: saveSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
