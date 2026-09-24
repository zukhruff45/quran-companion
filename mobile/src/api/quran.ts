import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

const getSettings = async () => {
  try {
    const stored = await AsyncStorage.getItem('app_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return { translation: 'en.asad', reciter: 'ar.alafasy' };
};

// Retry helper for API calls (retry exactly once on failure)
const fetchWithRetry = async (url: string, retries = 1) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 15000 });
      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`Retrying Quran API request to ${url}...`);
    }
  }
};

export const fetchSurahs = async () => {
  try {
    const response = await fetchWithRetry(`${QURAN_API_BASE}/surah`);
    const surahs = response!.data.data;
    // Cache the successful network response
    await AsyncStorage.setItem('quran_surahs', JSON.stringify(surahs));
    return surahs;
  } catch (error) {
    console.error('Network error fetching surahs, attempting fallback to cache...', error);
    const cached = await AsyncStorage.getItem('quran_surahs');
    if (cached) return JSON.parse(cached);
    throw new Error('Failed to fetch Surahs and no cached data available.');
  }
};

export const fetchSurahDetails = async (surahNumber: number) => {
  try {
    const settings = await getSettings();
    const mode = settings.translationMode || 'English';
    const urduEdition = settings.urduTranslation || 'ur.jalandhry';
    
    let editions = `quran-uthmani,${settings.translation}`;
    if (mode === 'Urdu') {
      editions = `quran-uthmani,${urduEdition}`;
    } else if (mode === 'Both') {
      editions = `quran-uthmani,${settings.translation},${urduEdition}`;
    }

    const response = await fetchWithRetry(`${QURAN_API_BASE}/surah/${surahNumber}/editions/${editions}`);
    const data = response!.data.data;
    // Cache the successful network response with editions key
    await AsyncStorage.setItem(`quran_surah_${surahNumber}_${editions}`, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(`Network error fetching surah ${surahNumber}, attempting fallback to cache...`, error);
    const settings = await getSettings();
    const mode = settings.translationMode || 'English';
    const urduEdition = settings.urduTranslation || 'ur.jalandhry';
    let editions = `quran-uthmani,${settings.translation}`;
    if (mode === 'Urdu') editions = `quran-uthmani,${urduEdition}`;
    else if (mode === 'Both') editions = `quran-uthmani,${settings.translation},${urduEdition}`;
    
    const cached = await AsyncStorage.getItem(`quran_surah_${surahNumber}_${editions}`);
    if (cached) return JSON.parse(cached);
    throw new Error(`Failed to fetch Surah ${surahNumber} details.`);
  }
};

export const fetchVerseAudio = async (surahNumber: number, verseNumber: number) => {
  try {
    const settings = await getSettings();
    const response = await fetchWithRetry(`${QURAN_API_BASE}/ayah/${surahNumber}:${verseNumber}/${settings.reciter}`);
    return response!.data.data.audio;
  } catch (error) {
    console.error('Error fetching audio:', error);
    return null; // Return null so audio player fails gracefully rather than crashing screen
  }
};

export const fetchDailyVerse = async (absoluteAyahNumber: number) => {
  try {
    const settings = await getSettings();
    const response = await fetchWithRetry(`${QURAN_API_BASE}/ayah/${absoluteAyahNumber}/editions/quran-uthmani,${settings.translation}`);
    const data = response!.data.data;
    await AsyncStorage.setItem(`daily_verse_${absoluteAyahNumber}_${settings.translation}`, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    const settings = await getSettings();
    const cached = await AsyncStorage.getItem(`daily_verse_${absoluteAyahNumber}_${settings.translation}`);
    if (cached) return JSON.parse(cached);
    return null;
  }
};

export const fetchTafsir = async (surahNumber: number, verseNumber: number) => {
  try {
    const settings = await getSettings();
    const tafsirId = settings.tafsirId || 169; // 169 = Ibn Kathir (English)
    const verseKey = `${surahNumber}:${verseNumber}`;
    
    // Check cache
    const cached = await AsyncStorage.getItem(`tafsir_${tafsirId}_${surahNumber}_${verseNumber}`);
    if (cached) return cached;

    const response = await fetchWithRetry(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    const tafsirData = response!.data.tafsir;

    // Correctness Safeguard: Verify the response metadata matches the requested verse key
    if (!tafsirData.verses || !tafsirData.verses[verseKey]) {
      console.warn(`Tafsir mapping mismatch for ${verseKey}. Treating as failed fetch.`);
      return null;
    }

    // Format HTML for readability
    let cleanText = tafsirData.text
        .replace(/<\/p>|<br\s*\/?>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    
    // Add attribution
    cleanText += `\n\n— ${tafsirData.resource_name} via Quran.com`;

    // Cache the result
    await AsyncStorage.setItem(`tafsir_${tafsirId}_${surahNumber}_${verseNumber}`, cleanText);

    return cleanText;
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return null;
  }
};
