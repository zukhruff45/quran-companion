import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backendApi from '../api/backend';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          // Verify token and fetch user profile
          const response = await backendApi.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data.user);
        }
      } catch (e) {
        console.log('Failed to load token or fetch user', e);
        // Clear invalid token
        await AsyncStorage.removeItem('userToken');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await backendApi.post('/auth/login', { email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    await AsyncStorage.setItem('userToken', response.data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await backendApi.post('/auth/register', { name, email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    await AsyncStorage.setItem('userToken', response.data.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
