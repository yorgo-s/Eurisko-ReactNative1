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
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {ProductStackParamList} from '../../navigation/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useProductDetails} from '../../hooks/useProducts';

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductDetails'>>();
  const navigation = useNavigation();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  // Get product ID from route params
  const productId = route.params._id;

  // Use React Query hook to fetch product details
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProductDetails(productId);

  // Extract product from data
  const product = productData?.data;

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    // Check if the URL is already absolute (starts with http or https)
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    // Otherwise, prepend the base URL
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  const handleShare = async () => {
    if (!product) return;

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
    console.log('Product added to cart:', productId);
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
      marginBottom: 8, // More space
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
      flexDirection: 'row',
    },
    shareButtonText: {
      ...getFontStyle('semiBold', 18),
      marginLeft: 8,
    },
    addToCartButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 2,
      marginLeft: 8,
      flexDirection: 'row',
    },
    addToCartButtonText: {
      ...getFontStyle('semiBold', 18),
      color: '#FFFFFF',
      marginLeft: 8,
    },
    sellerContainer: {
      marginTop: 16,
      marginBottom: 16,
      padding: 16,
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: 8,
    },
    sellerTitle: {
      ...typography.subtitle,
      marginBottom: 8,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sellerText: {
      ...typography.body,
      marginLeft: 8,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      ...typography.body,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  // Display loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{...typography.body, marginTop: 16}}>
          Loading product details...
        </Text>
      </View>
    );
  }

  // Display error state
  if (error || !product) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>
          {error
            ? `Error loading product: ${(error as Error).message}`
            : 'Product not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            {product.images && product.images.length > 0 ? (
              <Image
                source={{uri: getImageUrl(product.images[0]?.url)}}
                style={styles.image}
                testID="product-image"
              />
            ) : (
              <View style={[styles.image, {backgroundColor: colors.card}]} />
            )}
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

            {/* Seller Information */}
            <View style={styles.sellerContainer}>
              <Text style={styles.sellerTitle}>Seller</Text>
              <View style={styles.sellerInfo}>
                <Icon name="account" size={24} color={colors.text} />
                <Text style={styles.sellerText}>
                  {product.user?.email || 'Unknown Seller'}
                </Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                testID="share-button">
                <Icon name="share-variant" size={20} color={colors.text} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                testID="add-to-cart-button">
                <Icon name="cart-plus" size={20} color="#FFFFFF" />
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
