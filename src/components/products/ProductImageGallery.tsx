// src/components/products/ProductImageGallery.tsx

import React, {useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: Array<{url: string; _id: string}>;
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
    setCurrentIndex(index);
    onImagePress?.(index);
    console.log('Image pressed:', index);
  };

  // Handle long press to save image
  const handleLongPress = (imageUrl: string) => {
    Alert.alert(
      'Save Image',
      'Image saving feature will be implemented in a future update.',
      [{text: 'OK'}],
    );
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
        {images.map((image, index) => (
          <TouchableOpacity
            key={image._id}
            style={styles.imageContainer}
            onPress={() => handleImagePress(index)}
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
          {images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ProductImageGallery;
