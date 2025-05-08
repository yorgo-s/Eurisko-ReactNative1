import {Platform, TextStyle} from 'react-native';

// Define font family names
export const FONT_FAMILY = {
  POPPINS_LIGHT: 'Poppins-Light',
  POPPINS_REGULAR: 'Poppins-Regular',
  POPPINS_MEDIUM: 'Poppins-Medium',
  POPPINS_SEMI_BOLD: 'Poppins-SemiBold',
  POPPINS_BOLD: 'Poppins-Bold',
};

// Define font weights
export type FontWeight = 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';

// Map font weights to corresponding families
export const fontFamily = {
  light: FONT_FAMILY.POPPINS_LIGHT,
  regular: FONT_FAMILY.POPPINS_REGULAR,
  medium: FONT_FAMILY.POPPINS_MEDIUM,
  semiBold: FONT_FAMILY.POPPINS_SEMI_BOLD,
  bold: FONT_FAMILY.POPPINS_BOLD,
};

// Map font weights to numeric values for platforms that use them
export const fontWeight: {[key in FontWeight]: TextStyle['fontWeight']} = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Define font sizes
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heading: 28,
  title: 32,
};

// Helper function to get font style
export const getFont = (
  weight: FontWeight = 'regular',
  size: number = fontSize.md,
): TextStyle => {
  return {
    fontFamily: fontFamily[weight],
    fontSize: size,
    // On Android, we also need to set fontWeight
    ...(Platform.OS === 'android' && {fontWeight: fontWeight[weight]}),
  };
};

// Typography styles for consistent text appearance
export const typography = {
  heading1: {
    ...getFont('bold', fontSize.title),
    lineHeight: fontSize.title * 1.3,
  },
  heading2: {
    ...getFont('bold', fontSize.heading),
    lineHeight: fontSize.heading * 1.3,
  },
  heading3: {
    ...getFont('semiBold', fontSize.xxxl),
    lineHeight: fontSize.xxxl * 1.3,
  },
  subtitle: {
    ...getFont('semiBold', fontSize.lg),
    lineHeight: fontSize.lg * 1.5,
  },
  body: {
    ...getFont('regular', fontSize.md),
    lineHeight: fontSize.md * 1.5,
  },
  bodyBold: {
    ...getFont('semiBold', fontSize.md),
    lineHeight: fontSize.md * 1.5,
  },
  caption: {
    ...getFont('regular', fontSize.sm),
    lineHeight: fontSize.sm * 1.5,
  },
  button: {
    ...getFont('semiBold', fontSize.md),
  },
  label: {
    ...getFont('medium', fontSize.md),
  },
};
