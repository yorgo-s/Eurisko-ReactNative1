import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../screens/products/ProductsScreen';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;
const itemWidth = (width - normalize(36)) / 2; // Two columns with padding

// Function to normalize font size based on screen width
function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

const ProductCard = ({product, onPress}: ProductCardProps) => {
  const {colors, isDarkMode} = useContext(ThemeContext);

  const dynamicStyles = StyleSheet.create({
    container: {
      width: itemWidth,
      margin: normalize(6),
      borderRadius: normalize(8),
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: normalize(140),
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F7',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      padding: normalize(12),
    },
    title: {
      fontSize: normalize(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: normalize(4),
      // Limit to 2 lines
      lineHeight: normalize(20),
      height: normalize(40),
    },
    price: {
      fontSize: normalize(14),
      fontWeight: '700',
      color: colors.primary,
    },
  });

  return (
    <TouchableOpacity
      style={dynamicStyles.container}
      onPress={onPress}
      activeOpacity={0.8}
      testID={`product-card-${product._id}`}>
      <View style={dynamicStyles.imageContainer}>
        <Image
          source={{uri: product.images[0]?.url}}
          style={dynamicStyles.image}
          testID={`product-image-${product._id}`}
        />
      </View>
      <View style={dynamicStyles.contentContainer}>
        <Text
          style={dynamicStyles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
          testID={`product-title-${product._id}`}>
          {product.title}
        </Text>
        <Text
          style={dynamicStyles.price}
          testID={`product-price-${product._id}`}>
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
