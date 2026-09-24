import React, { useContext } from 'react';
import { StyleSheet, ActivityIndicator, Pressable, PressableProps, ViewStyle, TextStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeType } from '../../theme/theme';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  title: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button = ({
  variant = 'primary',
  title,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}: ButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getContainerStyles = () => {
    const baseStyle = [styles.base, { borderRadius: theme.borderRadius.md }];
    const isDisabled = disabled || loading;

    let variantStyle = {};
    if (variant === 'primary') {
      variantStyle = { backgroundColor: isDisabled ? theme.colors.textSecondary : theme.colors.primary };
    } else if (variant === 'secondary') {
      variantStyle = { backgroundColor: isDisabled ? theme.colors.textSecondary : theme.colors.secondary };
    } else if (variant === 'outline') {
      variantStyle = {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
      };
    } else if (variant === 'ghost') {
      variantStyle = { backgroundColor: 'transparent', opacity: isDisabled ? 0.5 : 1 };
    }

    return [baseStyle, variantStyle, style];
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return variant === 'primary' || variant === 'secondary' ? '#FFF' : theme.colors.textSecondary;
    }
    if (variant === 'primary' || variant === 'secondary') return '#FFF';
    return theme.colors.primary;
  };

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={(e) => {
        if (onPress && !disabled && !loading) {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress(e);
        }
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { opacity: pressed && variant !== 'ghost' ? 0.8 : 1 },
        pressed && variant === 'ghost' ? { backgroundColor: theme.colors.pattern } : {},
      ]}
      {...rest}
    >
      <Animated.View pointerEvents="none" style={[getContainerStyles(), animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {leftIcon}
            <Animated.Text
              style={[
                styles.text,
                { 
                  color: getTextColor(), 
                  fontFamily: theme.typography.family.primaryBold,
                  fontSize: theme.typography.size.body
                },
                textStyle
              ]}
            >
              {title}
            </Animated.Text>
            {rightIcon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    textAlign: 'center',
  },
});

export default Button;
