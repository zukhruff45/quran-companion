import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { SettingsContext } from '../context/SettingsContext';
import { AuthContext } from '../context/AuthContext';
import backendApi from '../api/backend';
import IconButton from '../components/ui/IconButton';

const Settings = ({ navigation }: any) => {
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
  const { translation, urduTranslation, translationMode, reciter, audioSpeed, language, tafsirId, updateSettings } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your reading history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('reading_history_full');
              await AsyncStorage.removeItem('last_read');
              if (user) {
                await backendApi.delete('/history/all');
              }
              alert('Reading history cleared!');
            } catch (e) {
              console.log('Failed to clear history');
            }
          }
        }
      ]
    );
  };

  const cycleTranslation = () => {
    const translations = ['en.asad', 'en.sahih', 'en.yusufali'];
    const idx = translations.indexOf(translation);
    updateSettings({ translation: translations[(idx + 1) % translations.length] });
  };

  const cycleTranslationMode = () => {
    const modes = ['English', 'Urdu', 'Both'];
    const idx = modes.indexOf(translationMode || 'English');
    updateSettings({ translationMode: modes[(idx + 1) % modes.length] });
  };

  const cycleUrduTranslation = () => {
    const urduTranslations = ['ur.jalandhry', 'ur.ahmedali', 'ur.junagarhi'];
    const idx = urduTranslations.indexOf(urduTranslation || 'ur.jalandhry');
    updateSettings({ urduTranslation: urduTranslations[(idx + 1) % urduTranslations.length] });
  };

  const cycleTafsir = () => {
    const tafsirs = [169, 168, 817, 160, 159]; // English & Urdu tafsirs
    const idx = tafsirs.indexOf(tafsirId);
    updateSettings({ tafsirId: tafsirs[(idx + 1) % tafsirs.length] });
  };

  const getTafsirName = (id: number) => {
    switch(id) {
      case 169: return "Ibn Kathir (English)";
      case 168: return "Ma'arif al-Qur'an (English)";
      case 817: return "Tazkirul Quran (English)";
      case 160: return "Ibn Kathir (Urdu)";
      case 159: return "Bayan ul Quran (Urdu)";
      default: return String(id);
    }
  };

  const cycleReciter = () => {
    const reciters = ['ar.alafasy', 'ar.abdulbasitmurattal', 'ar.minshawi'];
    const idx = reciters.indexOf(reciter);
    updateSettings({ reciter: reciters[(idx + 1) % reciters.length] });
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = speeds.indexOf(audioSpeed);
    updateSettings({ audioSpeed: speeds[(idx + 1) % speeds.length] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} accessible={true} accessibilityLabel="Go back" accessibilityRole="button" />
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold }]}>Appearance</Text>
          <View style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Dark Mode</Text>
            <Switch 
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold }]}>Quran Content</Text>
          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleTranslationMode}>
            <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Translation Mode</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{translationMode || 'English'}</Text>
          </TouchableOpacity>
          
          {(translationMode === 'English' || translationMode === 'Both' || !translationMode) && (
            <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleTranslation}>
              <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>English Translation</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{translation}</Text>
            </TouchableOpacity>
          )}

          {(translationMode === 'Urdu' || translationMode === 'Both') && (
            <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleUrduTranslation}>
              <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Urdu Translation</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{urduTranslation || 'ur.jalandhry'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleTafsir}>
            <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Tafsir (Commentary)</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{getTafsirName(tafsirId)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleReciter}>
            <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Reciter</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{reciter}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold }]}>Playback</Text>
          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]} onPress={cycleSpeed}>
            <Text style={[styles.settingText, { color: theme.colors.text, fontFamily: theme.typography.family.primary }]}>Audio Speed</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{audioSpeed}x</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold }]}>Data</Text>
          <TouchableOpacity 
            style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
            onPress={handleClearHistory}
          >
            <Text style={[styles.settingText, { color: theme.colors.error, fontFamily: theme.typography.family.primaryMedium }]}>Clear Reading History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { textAlign: 'center' },
  section: { marginTop: 24 },
  sectionTitle: { marginLeft: 20, marginBottom: 8, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  settingText: { fontSize: 16 },
});

export default Settings;
