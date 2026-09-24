import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.error('FATAL ERROR: EXPO_PUBLIC_API_URL is missing!');
  console.error('Please configure EXPO_PUBLIC_API_URL in your mobile/.env file.');
  
  if (__DEV__) {
    // Wait a tick for the UI to mount before alerting
    setTimeout(() => {
      Alert.alert(
        'Missing API URL', 
        'EXPO_PUBLIC_API_URL is not set in your .env file. Network requests will fail.',
        [{ text: 'OK' }]
      );
    }, 1000);
  }
}

const backendApi = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15-second timeout for mobile networks
});

// Request Interceptor: Inject JWT token
backendApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Retry once on network failure
backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Only retry network errors or 5xx server errors, not 4xx client errors
    if (!config || !error.isAxiosError) return Promise.reject(error);
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return Promise.reject(error);
    }
    
    // If it hasn't been retried yet
    if (!config.__isRetryRequest) {
      config.__isRetryRequest = true;
      console.warn(`Retrying request to ${config.url} due to network error...`);
      return backendApi(config); // Retry exactly once
    }
    
    return Promise.reject(error);
  }
);

export default backendApi;
