import React, { useContext } from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ThemeContext } from '../../context/ThemeContext';

interface IllustrationProps {
  size?: number;
}

export const EmptyBookmarks = ({ size = 120 }: IllustrationProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G fill="none" stroke={theme.colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M40 20 h40 a10 10 0 0 1 10 10 v70 l-30 -20 l-30 20 v-70 a10 10 0 0 1 10 -10 z" fill={theme.colors.surface} />
        <Path d="M50 40 h20 M50 55 h10" opacity="0.5" />
      </G>
    </Svg>
  );
};

export const EmptySearch = ({ size = 120 }: IllustrationProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G fill="none" stroke={theme.colors.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="50" cy="50" r="24" fill={theme.colors.surface} />
        <Path d="M67 67 l20 20" />
        <Path d="M40 40 l0 0 M60 60 l0 0" strokeWidth="2" stroke={theme.colors.secondary} opacity="0.5" />
      </G>
    </Svg>
  );
};

export const EmptyHistory = ({ size = 120 }: IllustrationProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G fill="none" stroke={theme.colors.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M60 75 V30 C60 30 50 25 35 25 C20 25 20 35 20 35 V80 C20 80 20 70 35 70 C50 70 60 75 60 75 Z" fill={theme.colors.surface} />
        <Path d="M60 75 V30 C60 30 70 25 85 25 C100 25 100 35 100 35 V80 C100 80 100 70 85 70 C70 70 60 75 60 75 Z" fill={theme.colors.surface} />
      </G>
    </Svg>
  );
};
