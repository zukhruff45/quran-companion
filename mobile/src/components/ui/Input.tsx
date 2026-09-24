import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableWithoutFeedback, TextInputProps, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const Input = ({ label, error, secureTextEntry, containerStyle, value, ...rest }: InputProps) => {
  const { theme } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const isSecure = secureTextEntry && !showPassword;

  // Floating label animation state (1 = floating up, 0 = resting down)
  const floatAnim = useSharedValue(value ? 1 : 0);
  
  useEffect(() => {
    if (isFocused || value) {
      floatAnim.value = withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) });
    } else {
      floatAnim.value = withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) });
    }
  }, [isFocused, value, floatAnim]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatAnim.value * -12 },
        { scale: 1 - (floatAnim.value * 0.2) } // scales down to 0.8
      ],
      color: error 
        ? theme.colors.error 
        : isFocused 
          ? theme.colors.primary 
          : theme.colors.textSecondary,
    };
  });

  const borderColor = error 
    ? theme.colors.error 
    : isFocused 
      ? theme.colors.primary 
      : theme.colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View style={[
          styles.container, 
          { 
            borderColor, 
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.lg,
          }
        ]}>
          
          <Animated.Text style={[
            styles.label, 
            { fontFamily: theme.typography.family.primary },
            labelAnimatedStyle
          ]}>
            {label}
          </Animated.Text>
          
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input, 
                { 
                  color: theme.colors.text, 
                  fontFamily: theme.typography.family.primary,
                  fontSize: theme.typography.size.body,
                  paddingTop: theme.spacing.md,
                  outlineStyle: 'none', // Fix for Web outline
                } as any
              ]}
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              secureTextEntry={isSecure}
              {...rest}
            />
            {secureTextEntry && (
              <TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}>
                <View style={styles.eyeIconContainer}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>

        </View>
      </TouchableWithoutFeedback>
      
      {error && (
        <Animated.Text style={[
          styles.errorText, 
          { color: theme.colors.error, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.caption }
        ]}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 16,
  } as any,
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingBottom: 4,
  },
  eyeIconContainer: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
