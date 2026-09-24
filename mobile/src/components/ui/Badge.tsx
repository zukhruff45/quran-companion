import React, { useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

const Badge = ({ label, variant = 'primary', style }: BadgeProps) => {
  const { theme } = useContext(ThemeContext);

  let containerStyle: any = {};
  let textStyle: any = {};

  if (variant === 'primary') {
    containerStyle = { backgroundColor: theme.colors.primary };
    textStyle = { color: '#FFF' };
  } else if (variant === 'secondary') {
    containerStyle = { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border };
    textStyle = { color: theme.colors.text };
  } else if (variant === 'outline') {
    containerStyle = { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary };
    textStyle = { color: theme.colors.primary };
  }

  return (
    <View style={[styles.container, containerStyle, { borderRadius: theme.borderRadius.full }, style]}>
      <Text style={[
        textStyle, 
        { 
          fontFamily: theme.typography.family.primaryMedium, 
          fontSize: theme.typography.size.caption 
        }
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Badge;
