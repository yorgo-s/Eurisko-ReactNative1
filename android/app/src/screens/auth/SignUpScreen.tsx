import React, {useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {ThemeContext} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {Dimensions, PixelRatio} from 'react-native';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375; // Base width on standard mobile screen

// Function to normalize font size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define validation schema with Zod
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
});

type SignUpFormData = z.infer<typeof signupSchema>;

const SignUpScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode} = useContext(ThemeContext);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    // Here we would usually register the user, but for this assignment
    // we'll just navigate to the verification screen
    navigation.navigate('Verification', {email: data.email});
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: normalize(20),
    },
    title: {
      fontSize: normalize(28),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: normalize(24),
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
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Create Account</Text>

        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.label}>Name</Text>
          <Controller
            control={control}
            name="name"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your full name"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={value}
                onChangeText={onChange}
                testID="name-input"
              />
            )}
          />
          {errors.name && (
            <Text style={dynamicStyles.errorText}>{errors.name.message}</Text>
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
            <Text style={dynamicStyles.errorText}>{errors.email.message}</Text>
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

        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.label}>Phone Number</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                testID="phone-input"
              />
            )}
          />
          {errors.phoneNumber && (
            <Text style={dynamicStyles.errorText}>
              {errors.phoneNumber.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={dynamicStyles.button}
          onPress={handleSubmit(onSubmit)}
          testID="signup-button">
          <Text style={dynamicStyles.buttonText}>Sign Up</Text>
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
  );
};

export default SignUpScreen;
