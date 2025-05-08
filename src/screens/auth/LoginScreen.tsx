import React, {useContext, useState} from 'react';
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
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {AuthContext} from '../../context/AuthContext';
import {ThemeContext} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {Dimensions, PixelRatio} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const {width, height} = Dimensions.get('window');
const scale = width / 375; // Base width on standard mobile screen

// Function to scale font size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define validation schema with Zod
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const navigation = useNavigation();
  const {login} = useContext(AuthContext);
  const {colors, isDarkMode} = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Attempting login with:', data.username, data.password);
    setIsLoading(true);
    const success = await login(data.username, data.password);
    setIsLoading(false);

    if (!success) {
      Alert.alert(
        'Login Failed',
        'Invalid username or password. Remember to use:\nUsername: eurisko\nPassword: academy2025',
        [{text: 'OK'}],
      );
    } else {
      console.log('Login successful!');
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
      fontSize: normalize(28),
      fontWeight: 'bold',
      color: colors.text,
      marginTop: normalize(20),
      marginBottom: normalize(30),
      textAlign: 'center',
    },
    inputContainer: {
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
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(14),
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
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontWeight: 'bold',
    },
    linkContainer: {
      marginTop: normalize(24),
      alignItems: 'center',
    },
    linkText: {
      color: colors.primary,
      fontSize: normalize(16),
    },
    helpText: {
      marginTop: normalize(12),
      color: colors.text,
      textAlign: 'center',
      fontSize: normalize(14),
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

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Username</Text>
            <Controller
              control={control}
              name="username"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  testID="username-input"
                />
              )}
            />
            {errors.username && (
              <Text style={dynamicStyles.errorText}>
                {errors.username.message}
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
            style={dynamicStyles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            testID="login-button">
            <Text style={dynamicStyles.buttonText}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <Text style={dynamicStyles.helpText}>
            Hint: Use username "eurisko" and password "academy2025"
          </Text>

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
