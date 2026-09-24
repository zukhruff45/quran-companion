import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import { ThemeContext } from '../../context/ThemeContext';

const IslamicPattern = ({ opacity = 0.05 }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="islamic" patternUnits="userSpaceOnUse" width="40" height="40">
            {/* Simple geometric repeating motif (8-point star) */}
            <Path
              d="M20 0 L25 15 L40 20 L25 25 L20 40 L15 25 L0 20 L15 15 Z"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="1"
            />
            <Path
              d="M0 0 L5 5 M40 40 L35 35 M0 40 L5 35 M40 0 L35 5"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="1"
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#islamic)" opacity={opacity} />
      </Svg>
    </View>
  );
};

export default IslamicPattern;
