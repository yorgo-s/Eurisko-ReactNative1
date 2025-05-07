import React, {useContext, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {ThemeContext} from '../../context/ThemeContext';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {Dimensions, PixelRatio} from 'react-native';
import {AuthStackParamList} from '../../navigation/types';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize font size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define validation schema with Zod
const verificationSchema = z.object({
  digit1: z.string().length(1, 'Required').regex(/^\d$/, 'Must be a number'),
  digit2: z.string().length(1, 'Required').regex(/^\d$/, 'Must be a number'),
  digit3: z.string().length(1, 'Required').regex(/^\d$/, 'Must be a number'),
  digit4: z.string().length(1, 'Required').regex(/^\d$/, 'Must be a number'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

const VerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verification'>>();
  const {colors, isDarkMode} = useContext(ThemeContext);
  const email = route.params?.email || 'your email';

  // References for TextInputs to enable auto-focus on next input
  const digit2Ref = useRef<TextInput>(null);
  const digit3Ref = useRef<TextInput>(null);
  const digit4Ref = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      digit1: '',
      digit2: '',
      digit3: '',
      digit4: '',
    },
  });

  const onSubmit = (data: VerificationFormData) => {
    const code = `${data.digit1}${data.digit2}${data.digit3}${data.digit4}`;

    // In a real app, we would verify the code with an API
    // For this assignment, we'll just show a success message and navigate to login
    Alert.alert(
      'Verification Successful',
      'Your account has been verified successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ],
    );
  };

  // Function to handle input and auto-focus on next field
  const handleDigitChange = (
    text: string,
    onChange: (value: string) => void,
    nextInputRef?: React.RefObject<TextInput>,
  ) => {
    // Only accept a single digit
    const singleDigit = text.slice(0, 1).replace(/[^0-9]/g, '');
    onChange(singleDigit);

    // Auto focus to next input if this one is filled
    if (singleDigit && nextInputRef?.current) {
      nextInputRef.current.focus();
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
      alignItems: 'center',
    },
    title: {
      fontSize: normalize(24),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: normalize(8),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: normalize(16),
      color: colors.text,
      marginBottom: normalize(40),
      textAlign: 'center',
    },
    emailText: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    digitContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      maxWidth: 280,
    },
    digitInput: {
      width: normalize(50),
      height: normalize(60),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(8),
      textAlign: 'center',
      fontSize: normalize(24),
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      color: colors.text,
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
      maxWidth: 280,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontWeight: 'bold',
    },
    resendContainer: {
      marginTop: normalize(24),
    },
    resendText: {
      color: colors.primary,
      fontSize: normalize(16),
    },
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Verification Code</Text>
        <Text style={dynamicStyles.subtitle}>
          We've sent a code to{' '}
          <Text style={dynamicStyles.emailText}>{email}</Text>
        </Text>

        <View style={dynamicStyles.digitContainer}>
          <Controller
            control={control}
            name="digit1"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[
                  dynamicStyles.digitInput,
                  errors.digit1 && dynamicStyles.digitInputError,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={text =>
                  handleDigitChange(text, onChange, digit2Ref)
                }
                autoFocus
                testID="digit1-input"
              />
            )}
          />

          <Controller
            control={control}
            name="digit2"
            render={({field: {onChange, value}}) => (
              <TextInput
                ref={digit2Ref}
                style={[
                  dynamicStyles.digitInput,
                  errors.digit2 && dynamicStyles.digitInputError,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={text =>
                  handleDigitChange(text, onChange, digit3Ref)
                }
                testID="digit2-input"
              />
            )}
          />

          <Controller
            control={control}
            name="digit3"
            render={({field: {onChange, value}}) => (
              <TextInput
                ref={digit3Ref}
                style={[
                  dynamicStyles.digitInput,
                  errors.digit3 && dynamicStyles.digitInputError,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={text =>
                  handleDigitChange(text, onChange, digit4Ref)
                }
                testID="digit3-input"
              />
            )}
          />

          <Controller
            control={control}
            name="digit4"
            render={({field: {onChange, value}}) => (
              <TextInput
                ref={digit4Ref}
                style={[
                  dynamicStyles.digitInput,
                  errors.digit4 && dynamicStyles.digitInputError,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={text => handleDigitChange(text, onChange)}
                testID="digit4-input"
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={dynamicStyles.button}
          onPress={handleSubmit(onSubmit)}
          testID="verify-button">
          <Text style={dynamicStyles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.resendContainer}
          testID="resend-button">
          <Text style={dynamicStyles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerificationScreen;
