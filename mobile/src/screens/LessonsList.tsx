import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';
import { quranMeta } from '../api/quran';
import IconButton from '../components/ui/IconButton';

const LessonsList = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: 18, marginLeft: 16 }}>Key Lessons</Text>
      </View>

      <FlatList
        data={quranMeta}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              ...theme.shadows.small
            }}
            onPress={() => navigation.navigate('SurahLessons', { surahNumber: item.number, surahName: item.englishName })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(32, 178, 137, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.primaryBold }}>{item.number}</Text>
              </View>
              <View>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: 16 }}>{item.englishName}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.family.primary, fontSize: 13 }}>{item.englishNameTranslation}</Text>
              </View>
            </View>
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.family.quran, fontSize: 20 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' }
});

export default LessonsList;
