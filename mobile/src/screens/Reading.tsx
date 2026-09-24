import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  SlideInDown,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import { fetchSurahDetails, fetchVerseAudio, fetchTafsir } from '../api/quran';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import backendApi from '../api/backend';
import IconButton from '../components/ui/IconButton';
import Skeleton from '../components/ui/Skeleton';

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList || Animated.View);

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

import * as Haptics from 'expo-haptics';

const AnimatedBookmarkButton = ({ onPress, isBookmarked }: { onPress: () => void, isBookmarked: boolean }) => {
  const scale = useSharedValue(1);
  const { theme } = useContext(ThemeContext);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(
      isBookmarked ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
    scale.value = withSequence(withSpring(1.4, { damping: 2, stiffness: 100 }), withSpring(1));
    onPress();
  };
  return (
    <Animated.View style={animatedStyle}>
      <IconButton icon={isBookmarked ? "bookmark" : "bookmark-outline"} color={isBookmarked ? theme.colors.primary : theme.colors.textSecondary} onPress={handlePress} />
    </Animated.View>
  );
};

const Reading = ({ route, navigation }: any) => {
  const { surahNumber, surahName } = route.params;
  const { theme, isDarkMode: isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { tafsirId } = useContext(SettingsContext);
  
  const [verses, setVerses] = useState<any[]>([]);
  const [arabicName, setArabicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sound, setSound] = useState<AudioPlayer | null>(null);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, boolean>>({});
  const [activeVerseMenu, setActiveVerseMenu] = useState<number | null>(null);
  const [visibleVerse, setVisibleVerse] = useState<number>(1);
  const [audioProgress, setAudioProgress] = useState(0);
  const [expandedTafsir, setExpandedTafsir] = useState<Record<number, string | null | false>>({});

  const flatListRef = useRef<any>(null);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    loadSurah();
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarksStr = await AsyncStorage.getItem('bookmarks');
      if (bookmarksStr) {
        const bookmarks = JSON.parse(bookmarksStr);
        const currentSurahBookmarks = bookmarks.filter((b: any) => b.surahNumber === surahNumber);
        const map: Record<number, boolean> = {};
        currentSurahBookmarks.forEach((b: any) => { map[b.verseNumber] = true; });
        setBookmarkedVerses(map);
      }
    } catch (e) {}
  };

  const loadSurah = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchSurahDetails(surahNumber);
      setArabicName(data[0].name);
      const combined = data[0].ayahs.map((ayah: any, index: number) => {
        let englishTranslation = null;
        let urduTranslation = null;
        
        // If data has 3 elements, Both mode is active: [0]=Arabic, [1]=English, [2]=Urdu
        if (data.length === 3) {
          englishTranslation = data[1].ayahs[index].text;
          urduTranslation = data[2].ayahs[index].text;
        } 
        // If data has 2 elements, either English or Urdu mode is active.
        // We know it's Urdu if the edition identifier contains 'ur.'
        else if (data.length === 2) {
          if (data[1].edition.identifier.includes('ur.')) {
            urduTranslation = data[1].ayahs[index].text;
          } else {
            englishTranslation = data[1].ayahs[index].text;
          }
        }
        
        return {
          ...ayah,
          translation: englishTranslation,
          urduTranslation: urduTranslation
        };
      });
      setVerses(combined);
      const historyItem = { surahNumber, surahName, verseNumber: 1, totalVerses: combined.length };
      await AsyncStorage.setItem('last_read', JSON.stringify(historyItem));
      if (user) {
        backendApi.post('/history', { surahNumber, verseNumber: 1 }).catch(() => {});
      }
    } catch (e) {
      console.log('Failed to fetch surah details', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadTafsir = async (verseNumber: number) => {
    // Toggle off if already open
    if (expandedTafsir[verseNumber]) {
      setExpandedTafsir(prev => ({ ...prev, [verseNumber]: false }));
      return;
    }
    
    // Set to null (loading state)
    setExpandedTafsir(prev => ({ ...prev, [verseNumber]: null }));
    
    const text = await fetchTafsir(surahNumber, verseNumber);
    setExpandedTafsir(prev => ({ 
      ...prev, 
      [verseNumber]: text || "Tafsir currently unavailable for this verse." 
    }));
  };

  const playAudio = async (verseNumber: number) => {
    try {
      if (sound) {
        sound.release();
        if (playingVerse === verseNumber) {
          setPlayingVerse(null);
          setSound(null);
          setAudioProgress(0);
          return;
        }
      }
      setPlayingVerse(verseNumber);
      setAudioProgress(0);
      
      const audioUrl = await fetchVerseAudio(surahNumber, verseNumber);
      if (audioUrl) {
        const newSound = createAudioPlayer(audioUrl);
        setSound(newSound);
        newSound.play();
        
        newSound.addListener('playbackStatusUpdate', (status: any) => {
          if (status.isLoaded) {
            setAudioProgress(status.currentTime / (status.duration || 1));
            if (status.didJustFinish) {
              if (verseNumber < verses.length) {
                playAudio(verseNumber + 1);
              } else {
                setPlayingVerse(null);
              }
            }
          }
        });
      }
    } catch (e) {
      console.log('Error playing audio', e);
      setPlayingVerse(null);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (playingVerse !== null && flatListRef.current && verses.length > 0) {
      flatListRef.current.scrollToIndex({ index: playingVerse - 1, animated: true, viewPosition: 0.5 });
    }
  }, [playingVerse]);

  const handleBookmark = async (verse: any) => {
    try {
      const isBookmarked = bookmarkedVerses[verse.numberInSurah];
      let newBookmarksMap = { ...bookmarkedVerses };
      if (isBookmarked) {
        newBookmarksMap[verse.numberInSurah] = false;
        const bookmarksStr = await AsyncStorage.getItem('bookmarks');
        if (bookmarksStr) {
          let bookmarks = JSON.parse(bookmarksStr);
          bookmarks = bookmarks.filter((b: any) => !(b.surahNumber === surahNumber && b.verseNumber === verse.numberInSurah));
          await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }
      } else {
        newBookmarksMap[verse.numberInSurah] = true;
        if (user) {
          await backendApi.post('/bookmarks', { surahNumber, verseNumber: verse.numberInSurah, arabicText: verse.text, translation: verse.translation });
        }
        const bookmarksStr = await AsyncStorage.getItem('bookmarks');
        let bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];
        bookmarks.push({ surahNumber, verseNumber: verse.numberInSurah, arabicText: verse.text, translation: verse.translation });
        await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
      setBookmarkedVerses(newBookmarksMap);
    } catch (e) {}
  };

  const handleShare = async (verse: any) => {
    const shareMessage = `${verse.text}\n\n${verse.translation}\n\n[Quran ${surahName} ${surahNumber}:${verse.numberInSurah}]`;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        alert('Verse copied to clipboard!');
      } else {
        const { Share } = await import('react-native');
        await Share.share({ message: shareMessage });
      }
    } catch (error) {}
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; }
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 50], [0, 0.1], Extrapolation.CLAMP),
    elevation: interpolate(scrollY.value, [0, 50], [0, 4], Extrapolation.CLAMP),
    borderBottomWidth: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP),
  }));

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisibleVerse(viewableItems[0].item.numberInSurah);
    }
  });

  const renderVerse = ({ item }: any) => {
    const isPlaying = playingVerse === item.numberInSurah;
    
    return (
      <View 
        style={[
          styles.verseContainer, 
          { 
            borderBottomColor: theme.colors.border,
            backgroundColor: isPlaying ? 'rgba(15, 110, 91, 0.05)' : 'transparent',
          }
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
          <View style={[styles.badge, { borderColor: theme.colors.primary }]}>
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium }}>
              {toArabicNumeral(item.numberInSurah)}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <IconButton icon={isPlaying ? 'pause' : 'play'} color={theme.colors.primary} onPress={() => playAudio(item.numberInSurah)} />
            <AnimatedBookmarkButton isBookmarked={!!bookmarkedVerses[item.numberInSurah]} onPress={() => handleBookmark(item)} />
            <IconButton icon="share-outline" onPress={() => handleShare(item)} />
          </View>
        </View>

        <Text style={{ 
          color: theme.colors.text, 
          fontFamily: theme.typography.family.quran, 
          fontSize: theme.typography.size.display, 
          textAlign: 'right', 
          marginBottom: theme.spacing.xl, 
          lineHeight: 65,
          paddingLeft: theme.spacing.xl
        }}>
          {item.text}
        </Text>
        
        {item.translation && (
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontFamily: theme.typography.family.primary, 
              fontSize: theme.typography.size.body, 
              lineHeight: 24,
              marginBottom: item.urduTranslation ? theme.spacing.lg : 0
            }}>
              {item.translation}
            </Text>
          )}

          {item.urduTranslation && (
            <View style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.primary
            }}>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontFamily: 'NotoNastaliqUrdu', 
                fontSize: 20, 
                lineHeight: 40,
                textAlign: 'right'
              }}>
                {item.urduTranslation}
              </Text>
            </View>
          )}

        <View style={{ marginTop: theme.spacing.lg }}>
          <Pressable 
            onPress={() => loadTafsir(item.numberInSurah)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm }}
            accessible={true} accessibilityLabel="Toggle Tafsir" accessibilityRole="button"
          >
            <Ionicons name={expandedTafsir[item.numberInSurah] ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.primary} />
            <Text style={{ marginLeft: 8, color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium }}>Tafsir (Explanation)</Text>
          </Pressable>

          {expandedTafsir[item.numberInSurah] !== undefined && (
            <Animated.View entering={FadeInDown.duration(200)} style={{ marginTop: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md }}>
              {expandedTafsir[item.numberInSurah] === null ? (
                <Skeleton height={80} />
              ) : (
                <Text style={{ 
                  color: theme.colors.text, 
                  fontFamily: (tafsirId === 160 || tafsirId === 159) ? 'NotoNastaliqUrdu' : theme.typography.family.primary, 
                  lineHeight: (tafsirId === 160 || tafsirId === 159) ? 40 : 24,
                  fontSize: (tafsirId === 160 || tafsirId === 159) ? 18 : theme.typography.size.body,
                  textAlign: (tafsirId === 160 || tafsirId === 159) ? 'right' : 'left'
                }}>
                  {expandedTafsir[item.numberInSurah]}
                </Text>
              )}
            </Animated.View>
          )}
        </View>
      </View>
    );
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Sticky Header */}
      <Animated.View style={[
        styles.stickyHeader, 
        { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, paddingTop: Math.max(insets.top, theme.spacing.lg) },
        headerAnimatedStyle
      ]}>
          <View style={styles.headerRow}>
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} color={theme.colors.text} accessible={true} accessibilityLabel="Go back" accessibilityRole="button" />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }}>{surahName}</Text>
              {arabicName ? (
                 <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.quran, fontSize: theme.typography.size.body }}>{arabicName}</Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconButton 
                icon="bulb-outline" 
                color={theme.colors.textSecondary} 
                onPress={() => navigation.navigate('SurahLessons', { surahNumber, surahName })} 
                accessible={true} accessibilityLabel="Key Lessons" accessibilityRole="button" 
              />
              <View style={[styles.miniBadge, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryMedium, fontSize: 12 }}>{visibleVerse}</Text>
              </View>
              <IconButton 
                icon="play-circle" 
                color={theme.colors.primary} 
                onPress={() => playAudio(visibleVerse || 1)} 
                accessible={true} accessibilityLabel="Play Surah" accessibilityRole="button"
              />
            </View>
          </View>
      </Animated.View>

      {loading ? (
        <View style={{ flex: 1, padding: theme.spacing.lg }}>
          <Skeleton height={150} style={{ marginBottom: theme.spacing.md }} />
          <Skeleton height={150} style={{ marginBottom: theme.spacing.md }} />
          <Skeleton height={150} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, marginBottom: theme.spacing.md }}>Failed to load Surah</Text>
          <IconButton icon="refresh" color={theme.colors.primary} onPress={loadSurah} />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={verses}
          keyExtractor={(item: any) => item.number.toString()}
          renderItem={renderVerse}
          contentContainerStyle={{ paddingTop: 100, paddingBottom: 100 }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info: any) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
        />
      )}

      {/* Floating Audio Player */}
      {playingVerse !== null && (
        <Animated.View entering={SlideInDown.duration(300)} style={[styles.floatingPlayer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, ...theme.shadows.medium, paddingBottom: Math.max(insets.bottom, 0) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md }}>
            <View>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.body }}>{surahName}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.caption }}>Ayah {playingVerse}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton 
                icon="play-skip-back" 
                color={theme.colors.text} 
                onPress={() => playingVerse > 1 && playAudio(playingVerse - 1)} 
                accessible={true} accessibilityLabel="Previous Verse" accessibilityRole="button"
              />
              <IconButton 
                icon="stop-circle" 
                size={36}
                color={theme.colors.error} 
                onPress={() => playAudio(playingVerse)} 
                accessible={true} accessibilityLabel="Stop Audio" accessibilityRole="button"
              />
              <IconButton 
                icon="play-skip-forward" 
                color={theme.colors.text} 
                onPress={() => playingVerse < verses.length && playAudio(playingVerse + 1)} 
                accessible={true} accessibilityLabel="Next Verse" accessibilityRole="button"
              />
            </View>
          </View>
          <View style={{ height: 3, backgroundColor: theme.colors.border, width: '100%' }}>
            <View style={{ height: '100%', backgroundColor: theme.colors.primary, width: `${audioProgress * 100}%` }} />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseContainer: { 
    borderBottomWidth: 1, 
    paddingHorizontal: 24, 
    paddingVertical: 32 
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 24,
    padding: 4
  },
  floatingPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  }
});

export default Reading;
