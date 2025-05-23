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
import {useProductDetails, useDeleteProduct} from '../../hooks/useProducts';
import {useAuthStore} from '../../store/authStore';
import {queryClient} from '../../api/queryClient';

// Import components
import ContactSeller from '../../components/products/ContactSeller';
import ProductImageGallery from '../../components/products/ProductImageGallery';
import ProductLocationMap from '../../components/products/ProductLocationMap';
import ImageViewing from 'react-native-image-viewing';

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

  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // Get product data from route params
  const routeProduct = route.params;
  const productId = routeProduct?._id;
  const {user} = useAuthStore();

  // Fetch product details from API
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProductDetails(productId || '', {
    enabled: !!productId,
    retry: 1,
  });

  // Delete mutation
  const deleteProductMutation = useDeleteProduct();

  // Get the product data (from API or route params)
  const product = useMemo(() => {
    if (productData?.success && productData.data) {
      return productData.data;
    }
    return routeProduct || null;
  }, [productData, routeProduct]);

  // Check if current user is the owner
  const isOwner = useMemo(() => {
    if (!user || !product) return false;

    const userId = user.id || user._id;
    const productUserId = product.user?._id || product.user?.id;

    return userId === productUserId;
  }, [user, product]);

  const isLandscape = windowWidth > windowHeight;

  // Handle image press to open viewer
  const handleImagePress = useCallback((index: number) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  }, []);

  // Get full image URL
  const getImageUrl = useCallback((relativeUrl: string) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  }, []);

  // Handle edit product
  const handleEditProduct = useCallback(() => {
    if (product) {
      navigation.navigate('EditProduct', product);
    }
  }, [product, navigation]);

  // Handle delete product
  const handleDeleteProduct = useCallback(() => {
    if (!productId) return;

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProductMutation.mutate(productId, {
              onSuccess: () => {
                Alert.alert('Success', 'Product deleted successfully!', [
                  {text: 'OK', onPress: () => navigation.goBack()},
                ]);
              },
              onError: (error: any) => {
                Alert.alert('Error', 'Failed to delete product');
              },
            });
          },
        },
      ],
    );
  }, [productId, deleteProductMutation, navigation]);

  // Handle sharing
  const handleShare = () => {
    Alert.alert('Share Product', `Share ${product?.title || 'this product'}`, [
      {text: 'OK'},
    ]);
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
    shareButton: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    shareButtonContent: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  // Error states
  if (!productId) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
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

  // Prepare images for viewer
  const productImages = (product.images || []).filter(img => img && img.url);
  const imageUrls = productImages.map(img => ({uri: getImageUrl(img.url)}));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
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
              onImagePress={handleImagePress}
            />
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            {/* Product Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {product.title || 'Untitled Product'}
              </Text>
              <Text style={styles.price}>
                ${(product.price || 0).toFixed(2)}
              </Text>
            </View>

            {/* Owner Actions */}
            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditProduct}>
                  <Icon name="pencil" size={20} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteProduct}
                  disabled={deleteProductMutation.isPending}>
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
              <Text style={styles.description}>
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
                <ContactSeller product={product} />
                <View style={styles.divider} />
              </>
            )}

            {/* Share Button */}
            <View style={styles.shareButton}>
              <TouchableOpacity
                style={styles.shareButtonContent}
                onPress={handleShare}>
                <Icon name="share-variant" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewing
        images={imageUrls}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        presentationStyle="overFullScreen"
        backgroundColor={colors.background}
        doubleTapToZoomEnabled={true}
        swipeToCloseEnabled={true}
      />
    </View>
  );
};

export default ProductDetailsScreen;
