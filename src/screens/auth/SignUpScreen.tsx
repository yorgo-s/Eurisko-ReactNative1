import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {ThemeContext} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {Dimensions, PixelRatio} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/types';
import {useAuthStore} from '../../store/authStore';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define validation schema with Zod
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type SignUpFormData = z.infer<typeof signupSchema>;

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  // Use the auth store
  const {signup, isLoading, error, clearError} = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Signup Error', error, [{text: 'OK', onPress: clearError}]);
    }
  }, [error, clearError]);

  const onSubmit = async (data: SignUpFormData) => {
    const success = await signup(
      data.firstName,
      data.lastName,
      data.email,
      data.password,
    );

    if (success) {
      navigation.navigate('Verification', {email: data.email});
    }
  };

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: normalize(20),
      paddingTop: Math.max(normalize(20), insets.top),
    },
    title: {
      ...typography.heading1,
      marginTop: normalize(20),
      marginBottom: normalize(24),
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: normalize(16),
    },
    label: {
      ...typography.label,
      marginBottom: normalize(8),
    },
    input: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: normalize(8),
      padding: normalize(12),
      ...getFontStyle('regular', normalize(16)),
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      marginTop: normalize(4),
    },
    button: {
      backgroundColor: colors.primary,
      padding: normalize(14),
      borderRadius: normalize(8),
      alignItems: 'center',
      marginTop: normalize(20),
    },
    buttonText: {
      ...getFontStyle('semiBold', normalize(16)),
      color: '#FFFFFF',
    },
    linkContainer: {
      marginTop: normalize(24),
      alignItems: 'center',
    },
    linkText: {
      ...getFontStyle('medium', normalize(16)),
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView contentContainerStyle={dynamicStyles.content}>
          <Text style={dynamicStyles.title}>Create Account</Text>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>First Name</Text>
            <Controller
              control={control}
              name="firstName"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  testID="firstName-input"
                />
              )}
            />
            {errors.firstName && (
              <Text style={dynamicStyles.errorText}>
                {errors.firstName.message}
              </Text>
            )}
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Last Name</Text>
            <Controller
              control={control}
              name="lastName"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  testID="lastName-input"
                />
              )}
            />
            {errors.lastName && (
              <Text style={dynamicStyles.errorText}>
                {errors.lastName.message}
              </Text>
            )}
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
              )}
            />
            {errors.email && (
              <Text style={dynamicStyles.errorText}>
                {errors.email.message}
              </Text>
            )}
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Create a password"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  testID="password-input"
                />
              )}
            />
            {errors.password && (
              <Text style={dynamicStyles.errorText}>
                {errors.password.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[dynamicStyles.button, isLoading && {opacity: 0.7}]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            testID="signup-button">
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={dynamicStyles.linkContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              testID="login-link">
              <Text style={dynamicStyles.linkText}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
