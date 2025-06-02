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
import {Product} from '../../api/products';
import AddToCartButton from '../cart/AddToCartButton';

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

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    // Check if the URL is already absolute (starts with http or https)
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    // Otherwise, prepend the base URL
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

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
      marginBottom: 8,
    },
    buttonContainer: {
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        testID={`product-card-${product._id}`}>
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{uri: getImageUrl(product.images[0]?.url)}}
              style={styles.image}
              testID={`product-image-${product._id}`}
            />
          ) : (
            <View style={[styles.image, {backgroundColor: colors.card}]} />
          )}
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

      {/* Add to Cart Button */}
      <View style={styles.buttonContainer}>
        <AddToCartButton
          product={product}
          size="small"
          style={{margin: 12, marginTop: 0}}
        />
      </View>
    </View>
  );
};

export default ProductCard;
