import React, {useContext, useState} from 'react';
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
import ContactSeller from '../../components/products/ContactSeller';
import ProductSharing, {
  QuickShareBar,
} from '../../components/products/ProductSharing';
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

  // Get product ID from route params - FIXED: Better null handling
  const productId = route.params?._id;
  const {user} = useAuthStore();

  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // FIXED: Add safety check for productId
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProductDetails(productId || '');

  // Extract product from data - FIXED: Better null handling
  const product = productData?.success ? productData.data : null;

  // Check if current user owns this product - FIXED: Better null checks
  const isOwner = user && product?.user?._id === user.id;

  // Mutation for deleting product
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['products']});
      Alert.alert('Success', 'Product deleted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete product',
      );
    },
  });

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  const handleEditProduct = () => {
    if (product) {
      navigation.navigate('EditProduct', product);
    }
  };

  const handleDeleteProduct = () => {
    if (!productId) return;

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProductMutation.mutate(productId),
        },
      ],
    );
  };

  // Handle image press to open image viewer
  const handleImagePress = (index: number) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
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
  });

  // FIXED: Early return for missing productId
  if (!productId) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>Invalid product ID</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Display loading state
  if (isLoading) {
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

  // FIXED: Better error handling
  if (error || !product) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>
          {error
            ? `Error loading product: ${
                error instanceof Error ? error.message : String(error)
              }`
            : 'Product not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // FIXED: Better null checking for images
  const productImages = product.images || [];
  const imageUrls = productImages.map(img => ({
    uri: getImageUrl(img.url),
  }));

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
          {/* Enhanced Image Gallery Section */}
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
              <Text style={styles.title} testID="product-title">
                {product.title || 'Untitled Product'}
              </Text>
              <Text style={styles.price} testID="product-price">
                ${(product.price || 0).toFixed(2)}
              </Text>
            </View>

            {/* Owner Actions (Edit/Delete) */}
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

            {/* Quick Share Bar (for non-owners) */}
            {!isOwner && (
              <QuickShareBar
                product={product}
                onShareComplete={() => {
                  console.log('Product shared successfully');
                }}
              />
            )}

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description} testID="product-description">
                {product.description || 'No description available'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <ProductLocationMap
                location={product.location}
                showOpenInMapsButton={true}
                productTitle={product.title}
              />
            </View>

            <View style={styles.divider} />

            {/* Contact Seller Section (for non-owners) */}
            {!isOwner && (
              <>
                <ContactSeller
                  product={product}
                  onContactComplete={() => {
                    console.log('Contact initiated');
                  }}
                />
                <View style={styles.divider} />
              </>
            )}

            {/* Full Product Sharing Component */}
            <ProductSharing
              product={product}
              onShareComplete={() => {
                console.log('Product shared successfully');
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewing
        images={imageUrls}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        HeaderComponent={({imageIndex}) => (
          <View
            style={{
              position: 'absolute',
              top: insets.top + 20,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              zIndex: 1,
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 14, fontWeight: '600'}}>
              {imageIndex + 1} / {imageUrls.length}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default ProductDetailsScreen;
