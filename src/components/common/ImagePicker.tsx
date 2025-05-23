// src/components/common/ImagePicker.tsx

import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useCamera, CameraImage} from '../../hooks/useCamera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ImagePickerProps {
  images: CameraImage[];
  onImagesChange: (images: CameraImage[]) => void;
  maxImages?: number;
  imageSize?: number;
  allowMultiple?: boolean;
  title?: string;
  showImageCount?: boolean;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  imageSize = 100,
  allowMultiple = true,
  title = 'Images',
  showImageCount = true,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  const {showImagePicker, isLoading} = useCamera({
    allowMultiple,
    maxImages,
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
  });

  const handleAddImages = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        'Maximum Images Reached',
        `You can only add up to ${maxImages} images.`,
        [{text: 'OK'}],
      );
      return;
    }

    const availableSlots = maxImages - images.length;
    const selectedImages = await showImagePicker();

    if (selectedImages.length > 0) {
      const imagesToAdd = selectedImages.slice(0, availableSlots);
      onImagesChange([...images, ...imagesToAdd]);
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newImages = [...images];
          newImages.splice(index, 1);
          onImagesChange(newImages);
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      ...getFontStyle('medium', 16),
      color: colors.text,
    },
    imageCount: {
      ...getFontStyle('regular', 14),
      color: colors.text,
      opacity: 0.7,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    imageBox: {
      width: imageSize,
      height: imageSize,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    addImageButton: {
      width: imageSize,
      height: imageSize,
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageButtonActive: {
      backgroundColor: colors.primary + '20',
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 8,
    },
    imageInfo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    imageInfoText: {
      ...getFontStyle('regular', 10),
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {showImageCount && (
          <Text style={styles.imageCount}>
            {images.length} / {maxImages}
          </Text>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesContainer}>
        {images.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={styles.imageBox}>
            <Image source={{uri: image.uri}} style={styles.image} />

            {/* Remove button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}>
              <Icon name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Image info */}
            {image.fileSize && (
              <View style={styles.imageInfo}>
                <Text style={styles.imageInfoText}>
                  {(image.fileSize / 1024 / 1024).toFixed(1)}MB
                </Text>
              </View>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            )}
          </View>
        ))}

        {/* Add image button */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={[
              styles.addImageButton,
              isLoading && styles.addImageButtonActive,
            ]}
            onPress={handleAddImages}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Icon name="plus" size={24} color={colors.primary} />
                <Text
                  style={{
                    ...getFontStyle('regular', 12),
                    color: colors.primary,
                    marginTop: 4,
                  }}>
                  Add
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default ImagePickerComponent;
