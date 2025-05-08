// src/screens/products/ProductDetailsScreen.tsx

import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from './ProductsScreen';
import {ProductStackParamList} from '../../navigation/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductDetails'>>();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const product = route.params;
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentWrapper: {
      flexDirection: isLandscape ? 'row' : 'column',
    },
    imageContainer: {
      width: isLandscape ? '50%' : '100%',
      height: isLandscape
        ? windowHeight - insets.top - insets.bottom
        : windowHeight * 0.4,
      backgroundColor: isDarkMode ? '#121212' : '#F0F0F0',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      padding: 16,
      width: isLandscape ? '50%' : '100%',
    },
    title: {
      ...typography.heading2,
      marginBottom: 8,
    },
    price: {
      ...getFontStyle('semiBold', 22),
      color: colors.primary,
      marginBottom: 16,
    },
    descriptionTitle: {
      ...typography.subtitle,
      fontSize: 20, // Larger subtitle (derived from typography)
      marginBottom: 8, // More space (was 8)
    },
    description: {
      ...typography.body,
      fontSize: 17,
      lineHeight: 20,
      marginBottom: 20,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    shareButton: {
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginRight: 8,
    },
    shareButtonText: {
      ...getFontStyle('semiBold', 18),
    },
    addToCartButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 2,
      marginLeft: 8,
    },
    addToCartButtonText: {
      ...getFontStyle('semiBold', 18),
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        testID="product-details-scroll">
        <View style={styles.contentWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: product.images[0]?.url}}
              style={styles.image}
              testID="product-image"
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title} testID="product-title">
              {product.title}
            </Text>
            <Text style={styles.price} testID="product-price">
              ${product.price.toFixed(2)}
            </Text>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description} testID="product-description">
              {product.description}
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                testID="share-button">
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                testID="add-to-cart-button">
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailsScreen;
