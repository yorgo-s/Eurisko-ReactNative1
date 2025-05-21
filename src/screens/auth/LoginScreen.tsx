import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
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
import {useContext} from 'react';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define validation schema with Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  // Use the auth store
  const {login, isLoading, error, clearError} = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Show error alert when auth error occurs
  // useEffect(() => {
  //   if (error) {
  //     Alert.alert('Login Error', error, [{text: 'OK', onPress: clearError}]);
  //   }
  // }, [error, clearError]);

  // In LoginScreen.tsx, update the onSubmit function:

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Attempting login with:', data.email);
      const success = await login(data.email, data.password);

      console.log('Login result:', success);

      if (!success) {
        if (!error) {
          // If there's no error from the store but login failed
          // Alert.alert(
          //   'Login Failed',
          //   'Invalid email or password. Please try again.',
          //   [{text: 'OK'}],
          // );
        }
      } else {
        console.log('Login successful!');
      }
    } catch (e) {
      console.error('Login error caught in component:', e);
      Alert.alert(
        'Error',
        'An unexpected error occurred: ' +
          (typeof e === 'object' && e !== null && 'message' in e
            ? (e as {message?: string}).message
            : JSON.stringify(e)),
      );
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
      marginBottom: normalize(30),
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
          <Text style={dynamicStyles.title}>Welcome Back</Text>
          {error && <Text style={dynamicStyles.errorText}>{error}</Text>}
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
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                  placeholder="Enter your password"
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
            testID="login-button">
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={dynamicStyles.linkContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              testID="signup-link">
              <Text style={dynamicStyles.linkText}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
