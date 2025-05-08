// src/components/products/ProductCard.tsx

import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../screens/products/ProductsScreen';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  numColumns: number;
};

const ProductCard = ({product, onPress, numColumns}: ProductCardProps) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const {width: windowWidth} = useWindowDimensions();

  // Calculate item width based on current window width and number of columns
  // Including padding/margin to ensure proper spacing
  const itemWidth = (windowWidth - 16 * (numColumns + 1)) / numColumns;

  const styles = StyleSheet.create({
    container: {
      width: itemWidth,
      margin: 8,
      borderRadius: 8,
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
      height: numColumns > 2 ? 120 : 140,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F7',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      padding: 12,
    },
    title: {
      ...getFontStyle('bold', 17),
      marginBottom: 4,
      lineHeight: 20,
      height: 40,
    },
    price: {
      ...getFontStyle('bold', 16),
      color: colors.primary,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      testID={`product-card-${product._id}`}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: product.images[0]?.url}}
          style={styles.image}
          testID={`product-image-${product._id}`}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
          testID={`product-title-${product._id}`}>
          {product.title}
        </Text>
        <Text style={styles.price} testID={`product-price-${product._id}`}>
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
