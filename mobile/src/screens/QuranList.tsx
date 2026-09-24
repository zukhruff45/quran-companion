import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchSurahs } from '../api/quran';
import { ThemeContext } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { EmptySearch } from '../components/svg/Illustrations';

import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const toArabicNumeral = (num: number) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
};

const QuranList = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const [surahs, setSurahs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const searchFlex = useSharedValue(0);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchSurahs();
      setSurahs(data);
      setFiltered(data);
    } catch (e) {
      console.error('Failed to fetch surahs');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text) {
      setFiltered(surahs);
      return;
    }
    const lower = text.toLowerCase();
    
    const safeText = lower.replace(/[^a-z0-9]/gi, '');
    let fuzzyRegex = null;
    if (safeText.length > 0) {
      fuzzyRegex = new RegExp(safeText.split('').join('.*'), 'i');
    }

    const result = surahs.filter((s: any) => {
      const eName = s.englishName.toLowerCase();
      return eName.includes(lower) || 
             s.number.toString().includes(lower) ||
             s.name.includes(lower) ||
             (fuzzyRegex && fuzzyRegex.test(eName));
    });
    setFiltered(result);
  };

  const handleFocus = () => {
    setIsFocused(true);
    searchFlex.value = withSpring(1, { damping: 15, stiffness: 100 });
  };

  const handleBlur = () => {
    if (!search) {
      setIsFocused(false);
      searchFlex.value = withSpring(0, { damping: 15, stiffness: 100 });
    }
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 0 : 1, { duration: 200 }),
    transform: [{ translateX: withTiming(isFocused ? -50 : 0, { duration: 200 }) }],
    width: isFocused ? 0 : 'auto',
    marginRight: isFocused ? 0 : theme.spacing.lg
  }));

  const searchContainerStyle = useAnimatedStyle(() => ({
    flex: isFocused ? 1 : undefined,
    width: isFocused ? '100%' : 44,
    backgroundColor: isFocused ? theme.colors.surface : 'transparent'
  }));

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Card 
        style={{ marginBottom: theme.spacing.md, padding: theme.spacing.lg }}
        onPress={() => navigation.navigate('Reading', { surahNumber: item.number, surahName: item.englishName })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Badge */}
          <View style={[styles.numberBadge, { borderColor: theme.colors.border, borderWidth: 1 }]}>
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryMedium, fontSize: 16 }}>
                {toArabicNumeral(item.number)}
              </Text>
            </View>
          </View>

          {/* Center Details */}
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3, marginBottom: 2 }}>{item.englishName}</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.caption, textTransform: 'uppercase' }}>{item.revelationType}</Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.textSecondary, opacity: 0.5 }} />
              <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.caption }}>{item.numberOfAyahs} AYAHS</Text>
            </View>
          </View>

          {/* Right Area */}
          <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.quranBold, fontSize: 32, marginBottom: 4 }}>{item.name}</Text>
          </View>
          <Pressable 
            onPress={(e) => { e.stopPropagation(); navigation.navigate('SurahLessons', { surahNumber: item.number, surahName: item.englishName }); }} 
            style={{ padding: 4, marginRight: 4 }}
          >
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          </Pressable>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={{ opacity: 0.3 }} />
        </View>
      </Card>
    </Animated.View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { padding: theme.spacing.xl, paddingTop: Math.max(insets.top, theme.spacing.xl) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Animated.View style={[titleAnimatedStyle, { overflow: 'hidden' }]}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1 }}>Quran</Text>
          </Animated.View>
          
          <Animated.View style={[
            styles.searchWrapper, 
            { borderColor: isFocused ? theme.colors.primary : theme.colors.border },
            searchContainerStyle
          ]}>
            <Pressable onPress={() => searchInputRef.current?.focus()} style={{ padding: 10 }}>
              <Ionicons name="search" size={20} color={isFocused ? theme.colors.primary : theme.colors.textSecondary} />
            </Pressable>
            {isFocused && (
              <TextInput
                ref={searchInputRef}
                style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.family.primary, fontSize: 16, height: '100%', outlineStyle: 'none' } as any}
                placeholder="Search Surahs..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={handleSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus={false}
              />
            )}
            {isFocused && search.length > 0 && (
              <Pressable onPress={() => { handleSearch(''); searchInputRef.current?.focus(); }} style={{ padding: 10 }}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </Animated.View>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Skeleton height={100} />
          <Skeleton height={100} />
          <Skeleton height={100} />
          <Skeleton height={100} />
        </View>
      ) : error ? (
        <EmptyState 
          illustration={<EmptySearch size={100} />}
          title="Failed to Load" 
          message="We couldn't connect to the Quran API. Please check your internet connection."
          actionLabel="Retry"
          onAction={loadSurahs}
        />
      ) : filtered.length === 0 ? (
        <EmptyState 
          illustration={<EmptySearch size={100} />}
          title="No Results" 
          message="We couldn't find any Surah matching your search." 
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.number.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: 0 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  numberBadge: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    transform: [{ rotate: '45deg' }]
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden'
  }
});

export default QuranList;
