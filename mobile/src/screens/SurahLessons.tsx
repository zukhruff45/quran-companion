import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import surahLessons from '../data/surahLessons';
import IconButton from '../components/ui/IconButton';
import EmptyState from '../components/ui/EmptyState';
import { EmptySearch } from '../components/svg/Illustrations';

const SurahLessons = ({ route, navigation }: any) => {
  const { surahNumber, surahName } = route.params;
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<'english' | 'urdu'>('english');
  const lessons = (surahLessons as any)[surahNumber];

  if (!lessons) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: 18, marginLeft: 16 }}>Key Lessons</Text>
        </View>
        <EmptyState 
          illustration={<EmptySearch size={100} />}
          title="Not Yet Available" 
          message={`Lessons for Surah ${surahName} are not yet available.`} 
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: 18, marginLeft: 16, flex: 1 }}>Key Lessons</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold, fontSize: 24, textAlign: 'center' }}>
            Main Lessons from Surah {surahName}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: 'NotoNastaliqUrdu', fontSize: 22, marginTop: 12, textAlign: 'center' }}>
            سورہ {lessons.urduName} کے اہم اسباق
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: 12, marginTop: 16, fontStyle: 'italic', textAlign: 'center' }}>
            {lessons.source}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 12 }}>
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              paddingVertical: 12, 
              alignItems: 'center', 
              backgroundColor: activeTab === 'english' ? theme.colors.primary : theme.colors.surface, 
              borderRadius: 12,
              borderWidth: 1,
              borderColor: activeTab === 'english' ? theme.colors.primary : theme.colors.border
            }}
            onPress={() => setActiveTab('english')}
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: theme.typography.family.primaryBold, color: activeTab === 'english' ? '#FFF' : theme.colors.text }}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              paddingVertical: 12, 
              alignItems: 'center', 
              backgroundColor: activeTab === 'urdu' ? theme.colors.primary : theme.colors.surface, 
              borderRadius: 12,
              borderWidth: 1,
              borderColor: activeTab === 'urdu' ? theme.colors.primary : theme.colors.border
            }}
            onPress={() => setActiveTab('urdu')}
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: 'NotoNastaliqUrdu', fontSize: 16, color: activeTab === 'urdu' ? '#FFF' : theme.colors.text }}>اردو</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'english' && (
          <View>
            {lessons.englishLessons.map((lesson: string, index: number) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} style={{ marginRight: 12, marginTop: 2 }} />
                <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.family.primary, fontSize: 16, lineHeight: 24 }}>
                  {lesson}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'urdu' && (
          <View>
            {lessons.urduLessons.map((lesson: string, index: number) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 24, justifyContent: 'flex-end' }}>
                <Text style={{ flex: 1, color: theme.colors.text, fontFamily: 'NotoNastaliqUrdu', fontSize: 18, lineHeight: 36, textAlign: 'right' }}>
                  {lesson}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} style={{ marginLeft: 12, marginTop: 6 }} />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' }
});

export default SurahLessons;
