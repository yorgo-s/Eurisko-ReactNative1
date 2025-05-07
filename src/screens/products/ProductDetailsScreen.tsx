import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  Share,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from './ProductsScreen';

// Get screen dimensions for responsive design
const {width, height} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize font size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Define the route param type
type RouteParams = {
  ProductDetails: Product;
};

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'ProductDetails'>>();
  const {colors, isDarkMode} = useContext(ThemeContext);
  const product = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing product: ${product.title} - ${product.description}`,
        title: product.title,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const handleAddToCart = () => {
    // In a real app, we would add the product to cart
    // For this assignment, no functionality is required
    console.log('Product added to cart:', product._id);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    imageContainer: {
      width: '100%',
      height: height * 0.4,
      backgroundColor: isDarkMode ? '#121212' : '#F0F0F0',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      padding: normalize(16),
    },
    title: {
      fontSize: normalize(24),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: normalize(8),
    },
    price: {
      fontSize: normalize(20),
      fontWeight: '600',
      color: colors.primary,
      marginBottom: normalize(16),
    },
    descriptionTitle: {
      fontSize: normalize(18),
      fontWeight: '600',
      color: colors.text,
      marginBottom: normalize(8),
    },
    description: {
      fontSize: normalize(16),
      color: colors.text,
      lineHeight: normalize(24),
      marginBottom: normalize(24),
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: normalize(24),
    },
    shareButton: {
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0',
      padding: normalize(12),
      borderRadius: normalize(8),
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginRight: normalize(8),
    },
    shareButtonText: {
      color: colors.text,
      fontSize: normalize(16),
      fontWeight: '600',
    },
    addToCartButton: {
      backgroundColor: colors.primary,
      padding: normalize(12),
      borderRadius: normalize(8),
      alignItems: 'center',
      justifyContent: 'center',
      flex: 2,
      marginLeft: normalize(8),
    },
    addToCartButtonText: {
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontWeight: '600',
    },
  });

  return (
    <ScrollView
      style={dynamicStyles.container}
      contentContainerStyle={dynamicStyles.scrollContent}
      testID="product-details-scroll">
      <View style={dynamicStyles.imageContainer}>
        <Image
          source={{uri: product.images[0]?.url}}
          style={dynamicStyles.image}
          testID="product-image"
        />
      </View>

      <View style={dynamicStyles.contentContainer}>
        <Text style={dynamicStyles.title} testID="product-title">
          {product.title}
        </Text>
        <Text style={dynamicStyles.price} testID="product-price">
          ${product.price.toFixed(2)}
        </Text>

        <Text style={dynamicStyles.descriptionTitle}>Description</Text>
        <Text style={dynamicStyles.description} testID="product-description">
          {product.description}
        </Text>

        <View style={dynamicStyles.buttonsContainer}>
          <TouchableOpacity
            style={dynamicStyles.shareButton}
            onPress={handleShare}
            testID="share-button">
            <Text style={dynamicStyles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.addToCartButton}
            onPress={handleAddToCart}
            testID="add-to-cart-button">
            <Text style={dynamicStyles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetailsScreen;
