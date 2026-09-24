import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/ui/Card';
import IconButton from '../components/ui/IconButton';
import IslamicPattern from '../components/svg/IslamicPattern';
import { EmptyHistory } from '../components/svg/Illustrations';
import backendApi from '../api/backend';
import { fetchDailyVerse, fetchSurahs } from '../api/quran';

const ProgressBar = ({ progress }: { progress: number }) => {
  const { theme } = useContext(ThemeContext);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginTop: theme.spacing.md }}>
      <Animated.View style={[{ height: '100%', backgroundColor: '#FFF', borderRadius: 3 }, animatedStyle]} />
    </View>
  );
};

const QuickAccessButton = ({ icon, label, onPress, theme }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => scale.value = withSpring(0.9)}
      onPressOut={() => scale.value = withSpring(1)}
      onPress={onPress}
      style={{ alignItems: 'center', flex: 1 }}
    >
      <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 8, ...theme.shadows.soft, borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.caption }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

const Home = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [history, setHistory] = useState<any>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [surahsMeta, setSurahsMeta] = useState<Record<number, any>>({});

  const hour = new Date().getHours();
  const isDayTime = hour >= 5 && hour < 18;

  const loadData = async () => {
    try {
      // 1. Fetch Surah Metadata to map names properly
      const surahsData = await fetchSurahs();
      const metaMap: Record<number, any> = {};
      surahsData.forEach((s: any) => { metaMap[s.number] = s; });
      setSurahsMeta(metaMap);

      // 2. Fetch History (Local + Backend if logged in)
      const savedHistory = await AsyncStorage.getItem('last_read');
      let localLatest = savedHistory ? JSON.parse(savedHistory) : null;
      let allHistory = localLatest ? [localLatest] : [];

      if (user) {
        try {
          const res = await backendApi.get('/history');
          if (res.data && res.data.length > 0) {
            allHistory = res.data.map((item: any) => ({
              surahNumber: item.surahNumber,
              verseNumber: item.verseNumber,
              surahName: metaMap[item.surahNumber]?.englishName || '',
              arabicName: metaMap[item.surahNumber]?.name || '',
              totalVerses: metaMap[item.surahNumber]?.numberOfAyahs || 1
            }));
            localLatest = allHistory[0];
          }
        } catch (err) {
          console.log('Failed to fetch backend history');
        }
      } else if (localLatest) {
        localLatest.arabicName = metaMap[localLatest.surahNumber]?.name;
        localLatest.totalVerses = metaMap[localLatest.surahNumber]?.numberOfAyahs || localLatest.totalVerses;
      }
      
      setHistory(localLatest);
      setRecentHistory(allHistory.slice(1, 6)); // Top 5 recent excluding latest

      // 3. Fetch Daily Verse
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const randomAyah = (dayOfYear % 6236) + 1;
      const verseData = await fetchDailyVerse(randomAyah);
      
      if (verseData && verseData.length >= 2) {
        setDailyVerse({
          surah: verseData[0].surah.number,
          surahName: verseData[0].surah.englishName,
          verse: verseData[0].numberInSurah,
          text: verseData[0].text,
          translation: verseData[1].text
        });
      }
    } catch (e) {
      console.log('Failed to load data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const progressPercent = history?.totalVerses ? (history.verseNumber / history.totalVerses) * 100 : 10;

  const handleShareDailyVerse = async () => {
    if (!dailyVerse) return;
    const shareMessage = `${dailyVerse.text}\n\n${dailyVerse.translation}\n\n[Quran ${dailyVerse.surahName} ${dailyVerse.surah}:${dailyVerse.verse}]`;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        alert('Verse copied to clipboard!');
      } else {
        const { Share } = await import('react-native');
        await Share.share({ message: shareMessage });
      }
    } catch (e) {
      console.log('Share failed');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    >
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.secondary]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={[styles.headerContainer, { padding: theme.spacing.xl, paddingTop: Math.max(insets.top + 20, theme.spacing.xxxl), paddingBottom: 60 }]}
      >
        <IslamicPattern opacity={0.1} />
        <View style={{ marginBottom: theme.spacing.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name={isDayTime ? 'sunny' : 'moon'} size={20} color="rgba(255, 255, 255, 0.8)" style={{ marginRight: 8 }} />
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.h3 }}>{isDayTime ? 'Good Morning,' : 'Good Evening,'}</Text>
          </View>
          <Text style={{ color: '#FFF', fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.display }}>{user?.name || 'Guest'}</Text>
        </View>
      </LinearGradient>

      <View style={{ padding: theme.spacing.xl }}>
        {/* Quick Access Row */}
        <Animated.View entering={FadeInDown.delay(50).duration(300)} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl }}>
          <QuickAccessButton icon="bulb" label="Key Lessons" onPress={() => navigation.navigate('LessonsList')} theme={theme} />
          <QuickAccessButton icon="time" label="History" onPress={() => navigation.navigate('Profile', { screen: 'History' })} theme={theme} />
          <QuickAccessButton icon="search" label="Search" onPress={() => navigation.navigate('Search')} theme={theme} />
          <QuickAccessButton icon="settings" label="Settings" onPress={() => navigation.navigate('Profile')} theme={theme} />
        </Animated.View>

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3, marginBottom: theme.spacing.md }}>Continue Reading</Text>
          {history ? (
            <Pressable onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: history.surahNumber, verseNumber: history.verseNumber } })}>
              <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, marginBottom: theme.spacing.xl, ...theme.shadows.medium, overflow: 'hidden' }}>
                <IslamicPattern opacity={0.05} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                  <View>
                    <Text style={{ color: '#FFF', fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h2 }}>{history.surahName}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.body }}>Ayah {history.verseNumber}</Text>
                  </View>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="play" size={24} color="#FFF" style={{ marginLeft: 4 }} />
                  </View>
                </View>
                {history.arabicName && <Text style={{ color: 'rgba(255,255,255,0.15)', fontFamily: theme.typography.family.quranBold, fontSize: 60, position: 'absolute', right: -10, top: -20, writingDirection: 'rtl' }}>{history.arabicName}</Text>}
                <ProgressBar progress={progressPercent} />
              </LinearGradient>
            </Pressable>
          ) : (
            <Card style={{ marginBottom: theme.spacing.xl, alignItems: 'center', paddingVertical: theme.spacing.xxl }}>
              <EmptyHistory size={80} />
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, marginTop: theme.spacing.md, textAlign: 'center' }}>Start your reading journey today.</Text>
            </Card>
          )}
        </Animated.View>

        {/* Recently Read Row */}
        {recentHistory.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(300)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }}>Recently Read</Text>
              <Pressable onPress={() => navigation.navigate('Profile', { screen: 'History' })}>
                <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium }}>View All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.xl }}>
              {recentHistory.map((item, index) => (
                <Card 
                  key={index} 
                  onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: item.surahNumber, verseNumber: item.verseNumber } })}
                  style={{ width: 140, marginRight: theme.spacing.md, padding: theme.spacing.lg }}
                >
                  <Ionicons name="book-outline" size={24} color={theme.colors.primary} style={{ marginBottom: theme.spacing.sm }} />
                  <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.body }} numberOfLines={1}>{item.surahName}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.caption }}>Ayah {item.verseNumber}</Text>
                </Card>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Daily Verse */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Card style={{ marginBottom: theme.spacing.xxxl, borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }}>Daily Verse</Text>
              {dailyVerse && (
                <Pressable onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: dailyVerse.surah, scrollToVerse: dailyVerse.verse } })}>
                  <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, padding: 4 }}>View Full</Text>
                </Pressable>
              )}
            </View>
            
            {dailyVerse && (
              <View>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.quran, fontSize: theme.typography.size.quranBase, textAlign: 'right', marginBottom: theme.spacing.lg, lineHeight: 45 }}>{dailyVerse.text}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body, lineHeight: 26, marginBottom: theme.spacing.md }}>"{dailyVerse.translation}"</Text>
                <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.caption }}>Surah {dailyVerse.surahName}, Ayah {dailyVerse.verse}</Text>
              </View>
            )}
          </Card>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  }
});

export default Home;
