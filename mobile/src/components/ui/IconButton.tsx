import React, { useContext } from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: "none" | "button" | "link" | "search" | "image" | "keyboardkey" | "text" | "adjustable" | "imagebutton" | "header" | "summary" | undefined;
  accessible?: boolean;
}

const IconButton = ({ 
  icon, 
  onPress, 
  size = 24, 
  color, 
  style, 
  disabled = false,
  accessibilityLabel,
  accessibilityRole = "button",
  accessible = true
}: IconButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const scale = useSharedValue(1);

  const defaultColor = color || theme.colors.textSecondary;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable
      onPress={(e) => {
        if (!disabled && onPress) {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }
      }}
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || `${icon} button`}
    >
      <Animated.View style={[
        styles.container,
        {
          minWidth: 44,
          minHeight: 44,
          opacity: disabled ? 0.5 : 1,
        },
        style,
        animatedStyle
      ]}>
        <Ionicons name={icon} size={size} color={defaultColor} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
});

export default IconButton;
