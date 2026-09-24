process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5005';
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, AuthProvider } from '../src/context/AuthContext';
import backendApi from '../src/api/backend';
import { Text, Button } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));

jest.mock('../src/api/backend', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const mockedBackendApi = backendApi as any;
const mockedAsyncStorage = AsyncStorage as any;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login stores token', async () => {
    mockedBackendApi.post.mockResolvedValueOnce({
      data: { token: 'fake-token', user: { name: 'Test User' } }
    });

    const TestComponent = () => {
      const { login, token, user } = React.useContext(AuthContext);
      return (
        <>
          <Text testID="token">{token}</Text>
          <Text testID="user">{user?.name}</Text>
          <Button title="Login" onPress={() => login('test@test.com', 'password')} />
        </>
      );
    };

    await render(<AuthProvider><TestComponent /></AuthProvider>);

    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('token').props.children).toBe('fake-token');
    });

    expect(screen.getByTestId('user').props.children).toBe('Test User');
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'fake-token');
  });

  it('logout clears token', async () => {
    mockedBackendApi.post.mockResolvedValueOnce({
      data: { token: 'fake-token', user: { name: 'Test User' } }
    });

    const TestComponent = () => {
      const { login, logout, token } = React.useContext(AuthContext);
      return (
        <>
          <Text testID="token">{token ? 'logged-in' : 'logged-out'}</Text>
          <Button title="Login" onPress={() => login('test@test.com', 'password')} />
          <Button title="Logout" onPress={logout} />
        </>
      );
    };

    await render(<AuthProvider><TestComponent /></AuthProvider>);

    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('token').props.children).toBe('logged-in');
    });

    fireEvent.press(screen.getByText('Logout'));
    await waitFor(() => {
      expect(screen.getByTestId('token').props.children).toBe('logged-out');
    });

    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
  });
});
