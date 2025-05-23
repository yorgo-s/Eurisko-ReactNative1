import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {ThemeContext} from '../../context/ThemeContext';
import {useAuthStore} from '../../store/authStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProfileImagePicker from './ProfileImagePicker';
import {CameraImage} from '../../hooks/useCamera';

// Validation schema matching signup rules
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const {user, updateUserProfile, isLoading} = useAuthStore();

  // State for profile image
  const [profileImage, setProfileImage] = useState<CameraImage | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (visible && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setProfileImage(null);
    }
  }, [visible, user, reset]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updateData: {
        firstName: string;
        lastName: string;
        profileImage?: any;
      } = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      if (profileImage) {
        updateData.profileImage = {
          uri: profileImage.uri,
          type: profileImage.type,
          name: profileImage.name,
        };
      }

      const success = await updateUserProfile(updateData);

      if (success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          {text: 'OK', onPress: onClose},
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Get profile image to display
  const getCurrentImageUri = (): string | null => {
    if (profileImage) {
      return profileImage.uri;
    }
    if (user?.profileImage?.url) {
      // Handle relative URLs from API
      return user.profileImage.url.startsWith('http')
        ? user.profileImage.url
        : `https://backend-practice.eurisko.me${user.profileImage.url}`;
    }
    return null;
  };

  // Get user initials for fallback
  const getInitials = () => {
    if (!user) return '?';
    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...getFontStyle('bold', 20),
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      ...getFontStyle('medium', 16),
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: 8,
      padding: 12,
      ...getFontStyle('regular', 16),
      color: colors.text,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      ...getFontStyle('regular', 14),
      color: colors.error,
      marginTop: 4,
    },
    buttonsContainer: {
      flexDirection: 'row',
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.card : '#F0F0F0',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginRight: 12,
    },
    cancelButtonText: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginLeft: 12,
    },
    saveButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePreview: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.primary + '10',
      borderRadius: 8,
      alignItems: 'center',
    },
    imagePreviewText: {
      ...getFontStyle('regular', 14),
      color: colors.primary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={styles.modal}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              testID="close-button">
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{width: 32}} />
          </View>

          <ScrollView style={styles.content}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <ProfileImagePicker
                currentImage={getCurrentImageUri()}
                onImageChange={setProfileImage}
                initials={getInitials()}
                isLoading={isLoading}
                size={120}
              />

              {profileImage && (
                <View style={styles.imagePreview}>
                  <Icon name="check-circle" size={20} color={colors.primary} />
                  <Text style={styles.imagePreviewText}>
                    New profile photo selected
                    {profileImage.fileSize &&
                      `\nSize: ${(profileImage.fileSize / 1024 / 1024).toFixed(
                        1,
                      )}MB`}
                  </Text>
                </View>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <Controller
                control={control}
                name="firstName"
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
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
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <Controller
                control={control}
                name="lastName"
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Enter your last name"
                    placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                    value={value}
                    onChangeText={onChange}
                    testID="lastName-input"
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
              testID="cancel-button">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && {opacity: 0.7}]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              testID="save-button">
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.saveButtonText, {marginLeft: 8}]}>
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
