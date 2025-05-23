import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useCamera, CameraImage} from '../../hooks/useCamera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileImagePickerProps {
  currentImage?: string | null;
  onImageChange: (image: CameraImage | null) => void;
  size?: number;
  initials?: string;
  showEditIcon?: boolean;
  isLoading?: boolean;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  currentImage,
  onImageChange,
  size = 120,
  initials = '?',
  showEditIcon = true,
  isLoading = false,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  const {
    openCamera,
    openLibrary,
    isLoading: cameraLoading,
  } = useCamera({
    allowMultiple: false,
    maxImages: 1,
    quality: 0.8,
    maxWidth: 400,
    maxHeight: 400,
  });

  const handleImageSelection = async () => {
    const options = [
      {
        text: 'Take Photo',
        onPress: async () => {
          const images = await openCamera();
          if (images.length > 0) {
            onImageChange(images[0]);
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const images = await openLibrary();
          if (images.length > 0) {
            onImageChange(images[0]);
          }
        },
      },
    ];

    // Add remove option if there's a current image
    if (currentImage) {
      options.push({
        text: 'Remove Photo',
        onPress: () => {
          Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove your profile photo?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => onImageChange(null),
              },
            ],
          );
        },
      });
    }

    options.push({text: 'Cancel', style: 'cancel'});

    Alert.alert('Change Profile Photo', 'Select an option', options);
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginBottom: 16,
    },
    imageContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.primary,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    initials: {
      ...getFontStyle('bold', size * 0.3),
      color: colors.primary,
    },
    editButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: size / 2,
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 12,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonSecondary: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      ...getFontStyle('semiBold', 14),
      color: '#FFFFFF',
      marginLeft: 4,
    },
    actionButtonTextSecondary: {
      color: colors.text,
    },
  });

  const isImageLoading = isLoading || cameraLoading;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleImageSelection}
        disabled={isImageLoading}>
        {currentImage ? (
          <Image source={{uri: currentImage}} style={styles.image} />
        ) : (
          <Text style={styles.initials}>{initials}</Text>
        )}

        {/* Edit icon */}
        {showEditIcon && (
          <View style={styles.editButton}>
            <Icon name="camera" size={20} color="#FFFFFF" />
          </View>
        )}

        {/* Loading overlay */}
        {isImageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </TouchableOpacity>

      {/* Action buttons (alternative to tap-to-edit) */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleImageSelection}
          disabled={isImageLoading}>
          <Icon name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            {currentImage ? 'Change' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {currentImage && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => onImageChange(null)}
            disabled={isImageLoading}>
            <Icon name="delete" size={16} color={colors.text} />
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}>
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfileImagePicker;
