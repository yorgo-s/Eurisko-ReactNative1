// src/screens/auth/SignUpScreen.tsx - Updated with Enhanced Camera Integration

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
import ProfileImagePicker from '../../components/profile/ProfileImagePicker';
import {CameraImage} from '../../hooks/useCamera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // State for profile image
  const [profileImage, setProfileImage] = useState<CameraImage | null>(null);
  const [showImageSection, setShowImageSection] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
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

  // Watch form values to generate initials
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Signup Error', error, [{text: 'OK', onPress: clearError}]);
    }
  }, [error, clearError]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Prepare profile image data if selected
      const profileImageData = profileImage
        ? {
            uri: profileImage.uri,
            type: profileImage.type,
            fileName: profileImage.name,
          }
        : undefined;

      const success = await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        profileImageData,
      );

      if (success) {
        navigation.navigate('Verification', {email: data.email});
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Get user initials for profile image fallback
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };

  const toggleImageSection = () => {
    setShowImageSection(!showImageSection);
    if (!showImageSection && profileImage) {
      // If hiding section and there's an image, keep it
      return;
    }
    if (showImageSection && !profileImage) {
      // If showing section but no image, don't clear anything
      return;
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
    profileImageSection: {
      marginBottom: normalize(24),
      borderRadius: normalize(12),
      backgroundColor: isDarkMode ? colors.card + '40' : colors.primary + '05',
      overflow: 'hidden',
    },
    profileImageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: normalize(16),
      borderBottomWidth: showImageSection ? 1 : 0,
      borderBottomColor: colors.border,
    },
    profileImageHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileImageTitle: {
      ...getFontStyle('semiBold', normalize(16)),
      color: colors.text,
      marginLeft: normalize(12),
    },
    profileImageSubtitle: {
      ...getFontStyle('regular', normalize(12)),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginLeft: normalize(12),
      marginTop: normalize(2),
    },
    profileImageContent: {
      padding: normalize(16),
      alignItems: 'center',
    },
    profileImageDescription: {
      ...getFontStyle('regular', normalize(14)),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      textAlign: 'center',
      marginBottom: normalize(16),
      lineHeight: normalize(20),
    },
    inputContainer: {
      marginBottom: normalize(16),
    },
    label: {
      ...typography.label,
      marginBottom: normalize(8),
    },
    requiredLabel: {
      ...typography.label,
      marginBottom: normalize(8),
    },
    requiredAsterisk: {
      color: colors.error,
    },
    input: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: normalize(8),
      padding: normalize(12),
      ...getFontStyle('regular', normalize(16)),
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputError: {
      borderColor: colors.error,
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
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      ...getFontStyle('semiBold', normalize(16)),
      color: '#FFFFFF',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      ...getFontStyle('semiBold', normalize(16)),
      color: '#FFFFFF',
      marginLeft: normalize(8),
    },
    linkContainer: {
      marginTop: normalize(24),
      alignItems: 'center',
    },
    linkText: {
      ...getFontStyle('medium', normalize(16)),
      color: colors.primary,
    },
    passwordRequirements: {
      marginTop: normalize(8),
      paddingHorizontal: normalize(4),
    },
    requirementText: {
      ...getFontStyle('regular', normalize(12)),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginBottom: normalize(2),
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: normalize(20),
    },
    sectionTitle: {
      ...getFontStyle('semiBold', normalize(16)),
      color: colors.text,
      marginBottom: normalize(8),
    },
    optionalBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: normalize(8),
      paddingVertical: normalize(2),
      borderRadius: normalize(10),
      marginLeft: normalize(8),
    },
    optionalText: {
      ...getFontStyle('medium', normalize(10)),
      color: colors.primary,
    },
    chevronIcon: {
      transform: [{rotate: showImageSection ? '180deg' : '0deg'}],
    },
    imagePreview: {
      marginTop: normalize(12),
      padding: normalize(12),
      backgroundColor: colors.primary + '10',
      borderRadius: normalize(8),
      alignItems: 'center',
    },
    imagePreviewText: {
      ...getFontStyle('regular', normalize(14)),
      color: colors.primary,
      textAlign: 'center',
    },
    skipButton: {
      marginTop: normalize(12),
      paddingVertical: normalize(8),
      paddingHorizontal: normalize(16),
      borderRadius: normalize(6),
      backgroundColor: isDarkMode ? '#333333' : '#F0F0F0',
      alignSelf: 'center',
    },
    skipButtonText: {
      ...getFontStyle('medium', normalize(14)),
      color: colors.text,
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
        <ScrollView
          contentContainerStyle={dynamicStyles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={dynamicStyles.title}>Create Account</Text>

          {/* Form Fields */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.requiredLabel}>
              First Name <Text style={dynamicStyles.requiredAsterisk}>*</Text>
            </Text>
            <Controller
              control={control}
              name="firstName"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[
                    dynamicStyles.input,
                    errors.firstName && dynamicStyles.inputError,
                  ]}
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
            <Text style={dynamicStyles.requiredLabel}>
              Last Name <Text style={dynamicStyles.requiredAsterisk}>*</Text>
            </Text>
            <Controller
              control={control}
              name="lastName"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[
                    dynamicStyles.input,
                    errors.lastName && dynamicStyles.inputError,
                  ]}
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
            <Text style={dynamicStyles.requiredLabel}>
              Email <Text style={dynamicStyles.requiredAsterisk}>*</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[
                    dynamicStyles.input,
                    errors.email && dynamicStyles.inputError,
                  ]}
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
            <Text style={dynamicStyles.requiredLabel}>
              Password <Text style={dynamicStyles.requiredAsterisk}>*</Text>
            </Text>
            <Controller
              control={control}
              name="password"
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[
                    dynamicStyles.input,
                    errors.password && dynamicStyles.inputError,
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  testID="password-input"
                />
              )}
            />
            {errors.password ? (
              <Text style={dynamicStyles.errorText}>
                {errors.password.message}
              </Text>
            ) : (
              <View style={dynamicStyles.passwordRequirements}>
                <Text style={dynamicStyles.requirementText}>
                  • At least 8 characters
                </Text>
                <Text style={dynamicStyles.requirementText}>
                  • At least one uppercase letter
                </Text>
                <Text style={dynamicStyles.requirementText}>
                  • At least one number
                </Text>
              </View>
            )}
          </View>

          <View style={dynamicStyles.divider} />

          {/* Profile Image Section */}
          <View style={dynamicStyles.profileImageSection}>
            <TouchableOpacity
              style={dynamicStyles.profileImageHeader}
              onPress={toggleImageSection}
              activeOpacity={0.7}>
              <View style={dynamicStyles.profileImageHeaderLeft}>
                <Icon name="camera-plus" size={24} color={colors.primary} />
                <View style={{flex: 1}}>
                  <Text style={dynamicStyles.profileImageTitle}>
                    Profile Photo
                  </Text>
                  <Text style={dynamicStyles.profileImageSubtitle}>
                    {profileImage
                      ? 'Photo selected'
                      : 'Add a photo to personalize your account'}
                  </Text>
                </View>
              </View>
              <View style={dynamicStyles.optionalBadge}>
                <Text style={dynamicStyles.optionalText}>OPTIONAL</Text>
              </View>
              <Icon
                name="chevron-down"
                size={20}
                color={colors.text}
                style={[dynamicStyles.chevronIcon, {marginLeft: 8}]}
              />
            </TouchableOpacity>

            {showImageSection && (
              <View style={dynamicStyles.profileImageContent}>
                <Text style={dynamicStyles.profileImageDescription}>
                  Adding a profile photo helps others recognize you and makes
                  your account more personal. You can always add or change it
                  later.
                </Text>

                <ProfileImagePicker
                  currentImage={profileImage?.uri || null}
                  onImageChange={setProfileImage}
                  initials={getInitials()}
                  size={100}
                  showEditIcon={true}
                />

                {profileImage && (
                  <View style={dynamicStyles.imagePreview}>
                    <Icon
                      name="check-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={dynamicStyles.imagePreviewText}>
                      Profile photo ready to upload
                      {profileImage.fileSize &&
                        `\nSize: ${(
                          profileImage.fileSize /
                          1024 /
                          1024
                        ).toFixed(1)}MB`}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={dynamicStyles.skipButton}
                  onPress={() => setShowImageSection(false)}>
                  <Text style={dynamicStyles.skipButtonText}>
                    {profileImage ? 'Done' : 'Skip for now'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              dynamicStyles.button,
              isLoading && dynamicStyles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            testID="signup-button">
            {isLoading ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={dynamicStyles.loadingText}>
                  Creating Account...
                </Text>
              </View>
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
