// src/components/common/CustomButton.tsx

import React, {useContext, useCallback} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  TouchableOpacityProps,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isPrimary?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

const CustomButton = React.memo(
  ({
    title,
    onPress,
    isPrimary = true,
    isLoading = false,
    disabled = false,
    testID,
    ...props
  }: CustomButtonProps) => {
    const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

    const dynamicStyles = StyleSheet.create({
      button: {
        backgroundColor: isPrimary ? colors.primary : 'transparent',
        padding: normalize(14),
        borderRadius: normalize(8),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: isPrimary ? 0 : 1,
        borderColor: colors.border,
        opacity: disabled ? 0.7 : 1,
      },
      buttonText: {
        ...getFontStyle('semiBold', normalize(16)),
        color: isPrimary ? '#FFFFFF' : colors.text,
      },
    });

    // Use useCallback to memoize the onPress function
    const handlePress = useCallback(() => {
      if (!isLoading && !disabled) {
        onPress();
      }
    }, [onPress, isLoading, disabled]);

    return (
      <TouchableOpacity
        style={dynamicStyles.button}
        onPress={handlePress} // Use the memoized handlePress
        disabled={isLoading || disabled}
        activeOpacity={0.8}
        testID={testID}
        {...props}>
        {isLoading ? (
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} />
        ) : (
          <Text style={dynamicStyles.buttonText}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

export default CustomButton;
