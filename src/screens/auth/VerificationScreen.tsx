import React, {useContext, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {Dimensions, PixelRatio} from 'react-native';
import {AuthStackParamList} from '../../navigation/types';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuthStore} from '../../store/authStore';
import {authApi} from '../../api/auth';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

type VerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Verification'
>;

const VerificationScreen = () => {
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verification'>>();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const email = route.params?.email || 'your email';
  const insets = useSafeAreaInsets();

  // Use the auth store
  const {verifyOtp, isLoading, error, clearError} = useAuthStore();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // State for OTP input
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // References for TextInputs to enable auto-focus on next input
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Initialize inputRefs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Verification Error', error, [
        {text: 'OK', onPress: clearError},
      ]);
    }

    if (resendError) {
      Alert.alert('Resend Error', resendError, [
        {text: 'OK', onPress: () => setResendError(null)},
      ]);
    }
  }, [error, resendError, clearError]);

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit code');
      return;
    }

    const success = await verifyOtp(email, otpString);
    if (success) {
      Alert.alert(
        'Verification Successful',
        'Your account has been verified successfully.',
        [{text: 'OK', onPress: () => navigation.navigate('Login')}],
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await authApi.resendVerificationOtp(email);
      if (response.success) {
        Alert.alert(
          'Success',
          'A new verification code has been sent to your email',
        );
      } else {
        setResendError('Failed to resend verification code');
      }
    } catch (error: any) {
      setResendError(
        error.response?.data?.error?.message ||
          'Failed to resend verification code',
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Function to handle input for each digit and auto-focus next field
  const handleDigitChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(0, 1);
    }

    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next field if text is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Function to handle backspace and auto-focus previous field
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: normalize(20),
      paddingTop: Math.max(normalize(20), insets.top),
      alignItems: 'center',
    },
    title: {
      ...typography.heading2,
      marginBottom: normalize(8),
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
      marginBottom: normalize(40),
      textAlign: 'center',
    },
    emailText: {
      ...getFontStyle('bold', normalize(16)),
      color: colors.primary,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      maxWidth: 300,
    },
    digitInput: {
      width: normalize(45),
      height: normalize(60),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(8),
      textAlign: 'center',
      ...getFontStyle('semiBold', normalize(24)),
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
    },
    digitInputError: {
      borderColor: colors.error,
    },
    button: {
      backgroundColor: colors.primary,
      padding: normalize(14),
      borderRadius: normalize(8),
      alignItems: 'center',
      marginTop: normalize(40),
      width: '80%',
      maxWidth: 300,
    },
    buttonText: {
      ...getFontStyle('semiBold', normalize(16)),
      color: '#FFFFFF',
    },
    resendContainer: {
      marginTop: normalize(24),
    },
    resendText: {
      ...getFontStyle('medium', normalize(16)),
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.title}>Verification Code</Text>
          <Text style={dynamicStyles.subtitle}>
            We've sent a code to{' '}
            <Text style={dynamicStyles.emailText}>{email}</Text>
          </Text>

          <View style={dynamicStyles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map(index => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={dynamicStyles.digitInput}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[index]}
                onChangeText={text => handleDigitChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                autoFocus={index === 0}
                testID={`digit${index + 1}-input`}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[dynamicStyles.button, isLoading && {opacity: 0.7}]}
            onPress={handleVerify}
            disabled={isLoading || otp.join('').length !== 6}
            testID="verify-button">
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.resendContainer}
            onPress={handleResendOtp}
            disabled={resendLoading}
            testID="resend-button">
            {resendLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={dynamicStyles.resendText}>Resend Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerificationScreen;
