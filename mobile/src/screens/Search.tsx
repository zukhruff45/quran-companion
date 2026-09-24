import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SectionList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { fetchSurahs } from '../api/quran';
import EmptyState from '../components/ui/EmptyState';
import { EmptySearch } from '../components/svg/Illustrations';
import axios from 'axios';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Card from '../components/ui/Card';

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

// HighlightText Component
const HighlightedText = ({ text, query, style, highlightStyle }: any) => {
  if (!query) return <Text style={style}>{text}</Text>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <Text style={style}>
      {parts.map((part: string, i: number) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <Text key={i} style={highlightStyle}>{part}</Text> 
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

const Search = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [surahMatches, setSurahMatches] = useState<any[]>([]);
  const [verseMatches, setVerseMatches] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const [allSurahs, setAllSurahs] = useState<any[]>([]);

  useEffect(() => {
    // Load surahs once for local search
    fetchSurahs().then(data => setAllSurahs(data)).catch(() => {});
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {}
  };

  const saveRecentSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      let searches = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
      setRecentSearches(searches);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
    } catch (e) {}
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem('recent_searches');
  };

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSurahMatches([]);
      setVerseMatches([]);
      setLoading(false);
      return;
    }
    
    executeSearch(debouncedQuery);
    saveRecentSearch(debouncedQuery);
  }, [debouncedQuery]);

  const executeSearch = async (searchTerm: string) => {
    setLoading(true);
    const lower = searchTerm.toLowerCase();
    
    // Local Surah Search
    const sMatches = allSurahs.filter((s: any) => 
      s.englishName.toLowerCase().includes(lower) || 
      s.name.includes(lower) || 
      s.number.toString() === lower
    );
    setSurahMatches(sMatches);

    // Remote Verse Search
    try {
      const response = await axios.get(`${QURAN_API_BASE}/search/${searchTerm}/all/en`);
      setVerseMatches(response.data.data.matches || []);
    } catch (error) {
      setVerseMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const sections = [];
  if (surahMatches.length > 0) {
    sections.push({ title: 'Surah Matches', data: surahMatches, type: 'surah' });
  }
  if (verseMatches.length > 0) {
    sections.push({ title: 'Verse Matches', data: verseMatches, type: 'verse' });
  }

  const renderItem = ({ item, section }: any) => {
    if (section.type === 'surah') {
      return (
        <Card 
          style={{ marginBottom: theme.spacing.md }}
          onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: item.number, surahName: item.englishName }})}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.caption }}>Surah {item.number}</Text>
              <HighlightedText 
                text={item.englishName} 
                query={debouncedQuery} 
                style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }} 
                highlightStyle={{ color: theme.colors.primary }}
              />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.quran, fontSize: 24 }}>{item.name}</Text>
          </View>
        </Card>
      );
    } else {
      return (
        <Card 
          style={{ marginBottom: theme.spacing.md }}
          onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: item.surah.number, surahName: item.surah.englishName, scrollToVerse: item.numberInSurah }})}
        >
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.caption, marginBottom: 4 }}>
            Surah {item.surah.englishName} : Ayah {item.numberInSurah}
          </Text>
          <HighlightedText 
            text={item.text} 
            query={debouncedQuery} 
            style={{ color: theme.colors.text, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body, lineHeight: 24 }} 
            highlightStyle={{ backgroundColor: 'rgba(15, 110, 91, 0.2)', fontWeight: 'bold' }}
          />
        </Card>
      );
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { padding: theme.spacing.xl, paddingTop: Math.max(insets.top, theme.spacing.xl) }]}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1, marginBottom: theme.spacing.lg }}>Search</Text>
        <View style={[styles.searchInputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text, fontFamily: theme.typography.family.primary } as any]}
            placeholder="Search surahs or verses..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {!query.trim() && isFocused && recentSearches.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(300)} style={{ padding: theme.spacing.xl, paddingTop: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryBold }}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium }}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((term, index) => (
            <TouchableOpacity 
              key={index}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
              onPress={() => { setQuery(term); setIsFocused(false); }}
            >
              <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.md }} />
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primary }}>{term}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      ) : loading && !surahMatches.length && !verseMatches.length ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : sections.length === 0 && debouncedQuery ? (
        <Animated.View entering={FadeIn}>
          <EmptyState 
            illustration={<EmptySearch size={100} />}
            title="No Results Found"
            message={`We couldn't find anything matching "${debouncedQuery}".`}
          />
        </Animated.View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item: any, index) => (item.number || item.numberInSurah).toString() + index}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3, marginBottom: theme.spacing.md, marginTop: theme.spacing.lg }}>
              {title}
            </Text>
          )}
          contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: 0 }}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  }
});

export default Search;
