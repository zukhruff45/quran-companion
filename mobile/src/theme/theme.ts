export const palette = {
  emerald: '#0F6E5B',
  emeraldDark: '#0A4A3D',
  gold: '#C9A15A',
  goldLight: '#DFBC7A',
  lightBackground: '#FAF9F6',
  darkBackground: '#0E1512',
  lightSurface: '#FFFFFF',
  darkSurface: '#1A231F',
  textLightModePrimary: '#1C2521',
  textLightModeSecondary: '#5C6C65',
  textDarkModePrimary: '#F2F5F3',
  textDarkModeSecondary: '#9AABA3',
  success: '#2E7D32',
  error: '#D32F2F',
  warning: '#F57C00',
  patternLight: 'rgba(15, 110, 91, 0.05)',
  patternDark: 'rgba(201, 161, 90, 0.05)',
  borderLight: '#E0E5E2',
  borderDark: '#2C3A35',
};

export const typography = {
  family: {
    primary: 'Inter_400Regular',
    primaryBold: 'Inter_700Bold',
    primaryMedium: 'Inter_500Medium',
    quran: 'Amiri_400Regular',
    quranBold: 'Amiri_700Bold',
  },
  size: {
    caption: 12,
    body: 16,
    h3: 20,
    h2: 24,
    h1: 32,
    display: 40,
    quranBase: 28, // optimized for readability
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: palette.emerald,
    secondary: palette.gold,
    background: palette.lightBackground,
    surface: palette.lightSurface,
    text: palette.textLightModePrimary,
    textSecondary: palette.textLightModeSecondary,
    border: palette.borderLight,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    pattern: palette.patternLight,
    card: palette.lightSurface, // React Navigation fallback
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#3DBA9E', // lighter emerald for WCAG AA contrast against dark background
    secondary: palette.gold,
    background: palette.darkBackground,
    surface: palette.darkSurface,
    text: palette.textDarkModePrimary,
    textSecondary: palette.textDarkModeSecondary,
    border: palette.borderDark,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    pattern: palette.patternDark,
    card: palette.darkSurface,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type ThemeType = typeof lightTheme;
