import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface ProductImage {
  url: string;
  _id: string;
}

interface ProductImageGalleryProps {
  images: Array<ProductImage>;
  containerHeight?: number;
  onImagePress?: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  containerHeight = screenHeight * 0.4,
  onImagePress,
}) => {
  const {colors, isDarkMode} = useContext(ThemeContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to get full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  // Handle image press
  const handleImagePress = (index: number) => {
    onImagePress?.(index);
  };

  // Request permission to save image
  const requestSavePermission = async () => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
      return result === RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to save images',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  // Handle long press to save image
  const handleLongPress = async (imageUrl: string) => {
    try {
      const hasPermission = await requestSavePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot save image without permission',
        );
        return;
      }

      Alert.alert(
        'Save Image',
        'Do you want to save this image to your device?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Save',
            onPress: async () => {
              try {
                const timestamp = new Date().getTime();
                const downloadDest = `${RNFS.PicturesDirectoryPath}/product_${timestamp}.jpg`;

                const options = {
                  fromUrl: imageUrl,
                  toFile: downloadDest,
                };

                const result = await RNFS.downloadFile(options).promise;

                if (result.statusCode === 200) {
                  Alert.alert('Success', 'Image saved to your gallery!');
                } else {
                  Alert.alert('Error', 'Failed to save image');
                }
              } catch (error) {
                console.error('Save image error:', error);
                Alert.alert('Error', 'Failed to save image');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permission');
    }
  };

  // Handle scroll to update current index
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentIndex(index);
  };

  const styles = StyleSheet.create({
    container: {
      width: screenWidth,
      height: containerHeight,
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      width: screenWidth,
      height: containerHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    dotsContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    activeDot: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    imageCounter: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    counterText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Icon name="image-off" size={40} color={colors.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {images.map((image: ProductImage, imageIndex: number) => (
          <TouchableOpacity
            key={image._id}
            style={styles.imageContainer}
            onPress={() => handleImagePress(imageIndex)}
            onLongPress={() => handleLongPress(getImageUrl(image.url))}
            activeOpacity={0.9}>
            <Image
              source={{uri: getImageUrl(image.url)}}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Counter */}
      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_: ProductImage, dotIndex: number) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                dotIndex === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ProductImageGallery;
