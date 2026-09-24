import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import { ThemeProvider } from '../src/context/ThemeContext';
import { View } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn()
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockView = ({ children, style, ...props }: any) => React.createElement(View, props, children);
  const MockText = ({ children, style, ...props }: any) => React.createElement(Text, props, children);
  return {
    __esModule: true,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((v: any) => v),
    withTiming: jest.fn((v: any) => v),
    createAnimatedComponent: (Component: any) => Component,
    Easing: {
      inOut: jest.fn((v: any) => v),
      ease: jest.fn()
    },
    default: { 
      createAnimatedComponent: (Component: any) => Component,
      View: MockView,
      Text: MockText
    },
    FadeIn: { duration: jest.fn() },
    Animated: {
      View: MockView,
      Text: MockText
    },
    View: MockView,
    Text: MockText
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' }
}));

describe('UI Components', () => {
  describe('Button', () => {
    it('renders correctly', async () => {
      await render(<ThemeProvider><Button title="Test Button" onPress={() => {}} /></ThemeProvider>);
      expect(screen.getByText('Test Button')).toBeTruthy();
    });

    it('fires onPress', async () => {
      const onPressMock = jest.fn();
      await render(<ThemeProvider><Button title="Press Me" onPress={onPressMock} /></ThemeProvider>);
      fireEvent.press(screen.getByText('Press Me'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('blocks press when disabled', async () => {
      const onPressMock = jest.fn();
      await render(<ThemeProvider><Button title="Disabled" disabled onPress={onPressMock} /></ThemeProvider>);
      fireEvent.press(screen.getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('renders correctly and accepts input', async () => {
      const onChangeMock = jest.fn();
      await render(<ThemeProvider><Input label="Test Label" placeholder="Enter text" value="" onChangeText={onChangeMock} /></ThemeProvider>);
      const input = screen.getByPlaceholderText('Enter text');
      fireEvent.changeText(input, 'New Text');
      expect(onChangeMock).toHaveBeenCalledWith('New Text');
    });

    it('renders error state correctly', async () => {
      await render(<ThemeProvider><Input label="Error Label" value="" error="Invalid input" /></ThemeProvider>);
      expect(screen.getByText('Invalid input')).toBeTruthy();
    });
  });
});
