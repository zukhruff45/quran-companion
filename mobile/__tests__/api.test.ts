import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSurahs } from '../src/api/quran';

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Quran API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSurahs', () => {
    it('returns network response and saves to cache on success', async () => {
      const mockData = { data: { data: [{ number: 1, name: 'Al-Fatihah' }] } };
      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await fetchSurahs();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ number: 1, name: 'Al-Fatihah' }]);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'quran_surahs',
        JSON.stringify([{ number: 1, name: 'Al-Fatihah' }])
      );
    });

    it('falls back to cache if network fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify([{ number: 2, name: 'Al-Baqarah' }])
      );

      const result = await fetchSurahs();

      // fetchWithRetry tries exactly twice (initial + 1 retry)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('quran_surahs');
      expect(result).toEqual([{ number: 2, name: 'Al-Baqarah' }]);
    });

    it('throws error if both network and cache fail', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      await expect(fetchSurahs()).rejects.toThrow('Failed to fetch Surahs and no cached data available.');
    });
  });
});
