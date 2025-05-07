import {Dimensions, PixelRatio} from 'react-native';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375; // Base width on standard mobile screen

// Function to normalize font size or spacing based on screen width
export const normalize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Light theme colors
export const lightColors = {
  background: '#FFFFFF',
  text: '#121212',
  card: '#F5F5F5',
  primary: '#6200ee',
  secondary: '#03dac6',
  border: '#E0E0E0',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

// Dark theme colors
export const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  card: '#1E1E1E',
  primary: '#BB86FC',
  secondary: '#03DAC5',
  border: '#2C2C2C',
  error: '#CF6679',
  success: '#66BB6A',
  warning: '#FFD54F',
  info: '#64B5F6',
};

// Common typography
export const typography = {
  fontSizeSmall: normalize(12),
  fontSizeRegular: normalize(14),
  fontSizeMedium: normalize(16),
  fontSizeLarge: normalize(18),
  fontSizeXLarge: normalize(20),
  fontSizeXXLarge: normalize(24),
  fontSizeHeading: normalize(28),

  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',

  lineHeightSmall: normalize(16),
  lineHeightRegular: normalize(20),
  lineHeightLarge: normalize(24),
  lineHeightXLarge: normalize(28),
  lineHeightXXLarge: normalize(32),
};

// Spacing values for consistent layout
export const spacing = {
  tiny: normalize(4),
  small: normalize(8),
  medium: normalize(12),
  regular: normalize(16),
  large: normalize(24),
  xLarge: normalize(32),
  xxLarge: normalize(40),
};

// Border radius values
export const borderRadius = {
  small: normalize(4),
  regular: normalize(8),
  medium: normalize(12),
  large: normalize(16),
  circular: normalize(100),
};

// Shadow styles for different elevations
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
};
