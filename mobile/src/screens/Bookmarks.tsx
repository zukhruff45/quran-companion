import React, { useEffect, useState, useContext } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View, Text, FlatList, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backendApi from '../api/backend';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import IconButton from '../components/ui/IconButton';
import EmptyState from '../components/ui/EmptyState';
import { EmptyBookmarks } from '../components/svg/Illustrations';

const Bookmarks = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      if (user) {
        const response = await backendApi.get('/bookmarks');
        setBookmarks(response.data);
      } else {
        const str = await AsyncStorage.getItem('bookmarks');
        if (str) setBookmarks(JSON.parse(str));
      }
    } catch (e) {
      console.log('Failed to load bookmarks', e);
    }
  };

  const deleteBookmark = async (id: string, index: number) => {
    try {
      if (user) {
        await backendApi.delete(`/bookmarks/${id}`);
      }
      
      const newBookmarks = [...bookmarks];
      newBookmarks.splice(index, 1);
      setBookmarks(newBookmarks);
      
      if (!user) {
        await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      }
    } catch (e) {
      console.log('Failed to delete bookmark');
    }
  };

  const handleShare = async (item: any) => {
    try {
      await Share.share({
        message: `${item.arabicText}\n\n"${item.translation}"\n\n- Surah ${item.surahNumber}, Verse ${item.verseNumber} (via Quran Companion)`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={styles.cardHeader}>
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.body }}>Surah {item.surahNumber} : {item.verseNumber}</Text>
          <View style={{ flexDirection: 'row' }}>
            <IconButton 
              icon="share-outline" 
              color={theme.colors.textSecondary} 
              onPress={() => handleShare(item)} 
              accessible={true} accessibilityLabel="Share verse" accessibilityRole="button"
            />
            <IconButton 
              icon="trash-outline" 
              color={theme.colors.error} 
              onPress={() => deleteBookmark(item._id, index)} 
              accessible={true} accessibilityLabel="Delete bookmark" accessibilityRole="button"
            />
          </View>
        </View>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.quran, fontSize: theme.typography.size.quranBase, textAlign: 'right', marginBottom: theme.spacing.lg, lineHeight: 45 }}>{item.arabicText}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.body, lineHeight: 26 }}>{item.translation}</Text>
      </Card>
    </Animated.View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { padding: theme.spacing.xl, paddingTop: Math.max(insets.top, theme.spacing.xxxl) }]}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1 }}>Bookmarks</Text>
      </View>

      {bookmarks.length === 0 ? (
        <EmptyState 
          illustration={<EmptyBookmarks size={100} />}
          title="No Bookmarks" 
          message="Verses you bookmark while reading will appear here." 
          actionLabel="Go Read"
          onAction={() => navigation.navigate('Quran')}
        />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, index) => item._id || index.toString()}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
});

export default Bookmarks;
