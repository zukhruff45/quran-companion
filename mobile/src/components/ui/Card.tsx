import React, { useContext } from 'react';
import { View, StyleSheet, ViewStyle, Image, ImageSourcePropType, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemeContext } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  imageHeader?: ImageSourcePropType;
  onPress?: () => void;
}

const Card = ({ children, style, imageHeader, onPress }: CardProps) => {
  const { theme } = useContext(ThemeContext);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const cardStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.soft,
    },
    style,
  ];

  const content = (
    <>
      {imageHeader && (
        <Image 
          source={imageHeader} 
          style={[styles.image, { borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg }]} 
          resizeMode="cover"
        />
      )}
      <View style={{ padding: theme.spacing.lg }}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={(e) => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Animated.View style={[cardStyle, animatedStyle]}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden', // to crop image corners
  },
  image: {
    width: '100%',
    height: 120,
  },
});

export default Card;
