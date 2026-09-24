import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import backendApi from '../api/backend';
import IconButton from '../components/ui/IconButton';

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays === 0) {
    if (diffInHours === 0) {
      if (diffInMinutes <= 1) return 'Just now';
      return `${diffInMinutes} mins ago`;
    }
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const History = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (user) {
        const response = await backendApi.get('/history');
        const grouped = response.data.map((item: any) => ({
          ...item,
          relativeTime: formatRelativeTime(item.lastReadAt)
        }));
        setHistory(grouped);
        await AsyncStorage.setItem('reading_history_full', JSON.stringify(grouped));
      } else {
        const str = await AsyncStorage.getItem('reading_history_full');
        if (str) {
          setHistory(JSON.parse(str));
        }
      }
    } catch (error) {
      console.error(error);
      const str = await AsyncStorage.getItem('reading_history_full');
      if (str) setHistory(JSON.parse(str));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    try {
      if (user) {
        await backendApi.delete(`/history/${id}`);
      }
      await AsyncStorage.setItem('reading_history_full', JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
      // Revert if failed
      loadHistory();
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your entire reading history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem('reading_history_full');
            await AsyncStorage.removeItem('last_read');
            if (user) {
              try {
                await backendApi.delete('/history/all');
              } catch (e) { console.error(e); }
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} accessible={true} accessibilityLabel="Go back" accessibilityRole="button" />
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h3 }]}>
          Reading History
        </Text>
        <IconButton icon="trash-outline" onPress={handleClearAll} accessible={true} accessibilityLabel="Clear all history" accessibilityRole="button" />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={theme.colors.border} />
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primaryMedium, marginTop: 16 }}>No history found.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => navigation.navigate('Quran', { screen: 'Reading', params: { surahNumber: item.surahNumber, verseNumber: item.verseNumber } })}
            >
              <View style={styles.historyIcon}>
                <Ionicons name="book-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.historyText}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.body }}>Surah {item.surahNumber}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: theme.typography.size.caption }}>Ayah {item.verseNumber} • {item.relativeTime}</Text>
              </View>
              <IconButton 
                icon="close-circle-outline" 
                color={theme.colors.error} 
                onPress={() => handleDelete(item._id, index)} 
                accessible={true} accessibilityLabel="Delete history item" accessibilityRole="button"
              />
            </TouchableOpacity>
          )}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  historyIcon: {
    marginRight: 16,
  },
  historyText: {
    flex: 1,
  }
});

export default History;
