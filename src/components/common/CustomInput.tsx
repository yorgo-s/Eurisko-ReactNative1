import React, {useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Dimensions,
  PixelRatio,
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

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
}

const CustomInput = ({
  label,
  error,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  testID,
  ...props
}: CustomInputProps) => {
  const {colors, isDarkMode} = useContext(ThemeContext);

  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: normalize(16),
    },
    label: {
      fontSize: normalize(16),
      color: colors.text,
      marginBottom: normalize(8),
    },
    input: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: normalize(8),
      padding: normalize(12),
      fontSize: normalize(16),
      color: colors.text,
      borderWidth: 1,
      borderColor: error ? colors.error : 'transparent',
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(14),
      marginTop: normalize(4),
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>{label}</Text>
      <TextInput
        style={dynamicStyles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
        testID={testID}
        {...props}
      />
      {error && <Text style={dynamicStyles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;
