import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import backendApi from '../api/backend';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const DailyVerse = ({ route, navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadVerse();
  }, []);

  const loadVerse = async () => {
    try {
      const stored = await AsyncStorage.getItem('daily_verse_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDailyVerse(parsed);
        checkBookmark(parsed);
      } else {
        // Fallback if not found
        navigation.goBack();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async (verseData: any) => {
    try {
      const str = await AsyncStorage.getItem('bookmarks');
      if (str) {
        const bookmarks = JSON.parse(str);
        const exists = bookmarks.some((b: any) => b.surahNumber === verseData.surah && b.verseNumber === verseData.verse);
        setIsBookmarked(exists);
      }
    } catch (e) {}
  };

  const handleBookmark = async () => {
    if (!dailyVerse) return;
    try {
      const newBookmarkedState = !isBookmarked;
      if (user && newBookmarkedState) {
        await backendApi.post('/bookmarks', {
          surahNumber: dailyVerse.surah,
          verseNumber: dailyVerse.verse,
          arabicText: dailyVerse.text,
          translation: dailyVerse.translation
        });
      }
      
      const str = await AsyncStorage.getItem('bookmarks');
      let bookmarks = str ? JSON.parse(str) : [];
      
      if (newBookmarkedState) {
        bookmarks.push({ surahNumber: dailyVerse.surah, verseNumber: dailyVerse.verse, arabicText: dailyVerse.text, translation: dailyVerse.translation });
      } else {
        bookmarks = bookmarks.filter((b: any) => !(b.surahNumber === dailyVerse.surah && b.verseNumber === dailyVerse.verse));
      }
      
      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(newBookmarkedState);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          newBookmarkedState ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
        ).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!dailyVerse) return;
    try {
      await Share.share({
        message: `${dailyVerse.text}\n\n"${dailyVerse.translation}"\n\n- Surah ${dailyVerse.surahName}, Verse ${dailyVerse.verse} (via Quran Companion)`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} accessible={true} accessibilityLabel="Go back" accessibilityRole="button" />
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }]}>
          Daily Verse
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl }}>
        {loading || !dailyVerse ? (
          <View>
            <Skeleton height={200} style={{ marginBottom: theme.spacing.lg }} />
            <Skeleton height={100} style={{ marginBottom: theme.spacing.lg }} />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, ...theme.shadows.medium }]}>
            <View style={styles.actionsRow}>
              <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.body }}>
                Surah {dailyVerse.surahName} • Ayah {dailyVerse.verse}
              </Text>
              <View style={styles.actionIcons}>
                <IconButton 
                  icon={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  color={isBookmarked ? theme.colors.primary : theme.colors.textSecondary} 
                  onPress={handleBookmark} 
                  accessible={true} accessibilityLabel="Bookmark verse" accessibilityRole="button"
                />
                <IconButton 
                  icon="share-outline" 
                  onPress={handleShare} 
                  accessible={true} accessibilityLabel="Share verse" accessibilityRole="button"
                />
              </View>
            </View>

            <Text style={{ 
              color: theme.colors.text, 
              fontFamily: theme.typography.family.quran, 
              fontSize: theme.typography.size.display, 
              textAlign: 'center', 
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.xxl, 
              lineHeight: 55 
            }}>
              {dailyVerse.text}
            </Text>

            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontFamily: theme.typography.family.primary, 
              fontSize: theme.typography.size.h3, 
              lineHeight: 32,
              textAlign: 'center',
              marginBottom: theme.spacing.xxxl
            }}>
              "{dailyVerse.translation}"
            </Text>

            <Button 
              title="Read in Context" 
              variant="primary" 
              leftIcon={<IconButton icon="book-outline" color="#FFF" disabled />}
              onPress={() => {
                navigation.navigate('Quran', { 
                  screen: 'Reading', 
                  params: { surahNumber: dailyVerse.surah, surahName: dailyVerse.surahName, scrollToVerse: dailyVerse.verse } 
                });
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    textAlign: 'center',
  },
  card: {
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionIcons: {
    flexDirection: 'row',
  }
});

export default DailyVerse;
