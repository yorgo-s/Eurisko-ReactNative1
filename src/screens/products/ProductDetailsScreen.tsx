import React, {useContext, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ThemeContext} from '../../context/ThemeContext';
import {ProductStackParamList} from '../../navigation/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useProductDetails} from '../../hooks/useProducts';
import {useAuthStore} from '../../store/authStore';
import {useMutation} from '@tanstack/react-query';
import {productsApi} from '../../api/products';
import {queryClient} from '../../api/queryClient';

// Import components with error boundaries
import ContactSeller from '../../components/products/ContactSeller';
import ProductImageGallery from '../../components/products/ProductImageGallery';
import ProductLocationMap from '../../components/products/ProductLocationMap';

// Simple sharing component to avoid complex imports
const SimpleProductSharing: React.FC<{product: any}> = ({product}) => {
  const {colors, getFontStyle} = useContext(ThemeContext);

  const handleShare = () => {
    Alert.alert('Share Product', `Share ${product.title}`, [{text: 'OK'}]);
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
      }}>
      <TouchableOpacity
        onPress={handleShare}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name="share-variant" size={20} color="#FFFFFF" />
        <Text
          style={{
            ...getFontStyle('semiBold', 16),
            color: '#FFFFFF',
            marginLeft: 8,
          }}>
          Share Product
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const {width: screenWidth} = Dimensions.get('window');

type ProductDetailsScreenNavigationProp = StackNavigationProp<
  ProductStackParamList,
  'ProductDetails'
>;

const ProductDetailsScreen = () => {
  const route = useRoute<RouteProp<ProductStackParamList, 'ProductDetails'>>();
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  // Get product data from route params
  const routeProduct = route.params;
  const productId = routeProduct?._id;
  const {user} = useAuthStore();

  console.log('ProductDetailsScreen - productId:', productId);
  console.log('ProductDetailsScreen - routeProduct:', routeProduct);

  // SAFE: Only fetch from API if we have a valid productId, but don't crash if API fails
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProductDetails(productId || '', {
    enabled: !!productId,
    retry: 1, // Reduce retries to avoid issues
  });

  // SAFE: Product data extraction with multiple fallbacks
  const product = useMemo(() => {
    try {
      // Priority 1: Fresh API data
      if (productData?.success && productData.data) {
        console.log('Using API data:', productData.data);
        return productData.data;
      }

      // Priority 2: Route params
      if (routeProduct && routeProduct._id) {
        console.log('Using route params data:', routeProduct);
        return routeProduct;
      }

      console.log('No product data available');
      return null;
    } catch (err) {
      console.error('Error in product data extraction:', err);
      return routeProduct || null;
    }
  }, [productData, routeProduct]);

  // SAFE: Owner check with multiple safety nets
  const isOwner = useMemo(() => {
    try {
      if (!user || !product) return false;

      const userId = user.id || user._id;
      const productUserId = product.user?._id || product.user?.id;

      console.log(
        'Owner check - userId:',
        userId,
        'productUserId:',
        productUserId,
      );
      return userId === productUserId;
    } catch (err) {
      console.error('Error in owner check:', err);
      return false;
    }
  }, [user, product]);

  // Delete mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['products']});
      Alert.alert('Success', 'Product deleted successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
      Alert.alert('Error', 'Failed to delete product');
    },
  });

  const isLandscape = windowWidth > windowHeight;

  // SAFE: Image URL function
  const getImageUrl = useCallback((relativeUrl: string) => {
    try {
      if (!relativeUrl) return '';
      if (relativeUrl.startsWith('http')) return relativeUrl;
      return `https://backend-practice.eurisko.me${relativeUrl}`;
    } catch (err) {
      console.error('Error in getImageUrl:', err);
      return '';
    }
  }, []);

  const handleEditProduct = useCallback(() => {
    try {
      if (product) {
        navigation.navigate('EditProduct', product);
      }
    } catch (err) {
      console.error('Error in handleEditProduct:', err);
      Alert.alert('Error', 'Cannot edit product at this time');
    }
  }, [product, navigation]);

  const handleDeleteProduct = useCallback(() => {
    try {
      if (!productId) return;

      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteProductMutation.mutate(productId),
          },
        ],
      );
    } catch (err) {
      console.error('Error in handleDeleteProduct:', err);
      Alert.alert('Error', 'Cannot delete product at this time');
    }
  }, [productId, deleteProductMutation]);

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
    imageSection: {
      width: isLandscape ? '50%' : '100%',
      height: isLandscape
        ? windowHeight - insets.top - insets.bottom
        : windowHeight * 0.4,
    },
    contentContainer: {
      padding: 16,
      width: isLandscape ? '50%' : '100%',
      flex: isLandscape ? 1 : undefined,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      ...typography.heading2,
      marginBottom: 8,
      color: colors.text,
    },
    price: {
      ...getFontStyle('bold', 24),
      color: colors.primary,
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      ...getFontStyle('semiBold', 18),
      color: colors.text,
      marginBottom: 12,
    },
    description: {
      ...typography.body,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    ownerActions: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
    },
    editButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    editButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
    deleteButton: {
      backgroundColor: colors.error,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    deleteButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
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
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  });

  // Early returns for error states
  if (!productId) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>Invalid product ID</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !product) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{...typography.body, marginTop: 16, color: colors.text}}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Icon name="package-variant-closed" size={48} color={colors.error} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SAFE: Image processing
  const productImages = (product.images || []).filter(img => img && img.url);

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
          {/* Image Gallery Section */}
          <View style={styles.imageSection}>
            <ProductImageGallery
              images={productImages}
              containerHeight={
                isLandscape
                  ? windowHeight - insets.top - insets.bottom
                  : windowHeight * 0.4
              }
              onImagePress={index => console.log('Image pressed:', index)}
            />
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            {/* Product Header */}
            <View style={styles.header}>
              <Text style={styles.title} testID="product-title">
                {product.title || 'Untitled Product'}
              </Text>
              <Text style={styles.price} testID="product-price">
                ${(product.price || 0).toFixed(2)}
              </Text>
            </View>

            {/* Owner Actions */}
            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditProduct}
                  testID="edit-button">
                  <Icon name="pencil" size={20} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteProduct}
                  disabled={deleteProductMutation.isPending}
                  testID="delete-button">
                  {deleteProductMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Icon name="delete" size={20} color="#FFFFFF" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description} testID="product-description">
                {product.description || 'No description available'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <ProductLocationMap
                location={product.location}
                showOpenInMapsButton={true}
                productTitle={product.title}
              />
            </View>

            <View style={styles.divider} />

            {/* Contact Seller (for non-owners) */}
            {!isOwner && (
              <>
                <ContactSeller
                  product={product}
                  onContactComplete={() => console.log('Contact initiated')}
                />
                <View style={styles.divider} />
              </>
            )}

            {/* Simple Sharing */}
            <SimpleProductSharing product={product} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailsScreen;
