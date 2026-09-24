import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { ThemeContext } from '../../context/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton = ({ width, height = 20, borderRadius, style }: SkeletonProps) => {
  const { theme } = useContext(ThemeContext);
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animValue.value, [0, 1], [0.3, 0.7]);
    return {
      opacity,
    };
  });

  const baseStyle: ViewStyle = {
    width,
    height,
    backgroundColor: theme.colors.border,
    borderRadius: borderRadius ?? theme.borderRadius.md,
  };

  return <Animated.View style={[baseStyle, animatedStyle, style]} />;
};

export default Skeleton;
