import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  PermissionsAndroid,
  Modal,
  Platform,
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
import ProductLocationMap from '../../components/products/ProductLocationMap';
import ProductSharing from '../../components/products/ProductSharing';
import RNFS from 'react-native-fs';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

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

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get product ID from route params
  const productId = route.params._id;

  const {user} = useAuthStore();

  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use React Query hook to fetch product details
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProductDetails(productId);

  // Extract product from data
  const product = productData?.data;

  // Check if current user owns this product
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
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  const handleEditProduct = () => {
    navigation.navigate('EditProduct', product);
  };

  const handleDeleteProduct = () => {
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

  const handleImageScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleImageLongPress = async (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowSaveModal(true);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), we need different permissions
        if (Platform.Version >= 33) {
          const permission = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          if (permission === RESULTS.GRANTED) {
            return true;
          }

          const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          return result === RESULTS.GRANTED;
        } else {
          // For older Android versions
          const permission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );

          if (permission) {
            return true;
          }

          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to storage to save images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }

    // iOS doesn't need permission for saving to photo library with RNFS
    return true;
  };

  const saveImageToGallery = async () => {
    try {
      setIsSaving(true);

      // Check and request permissions
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to save images. Please enable it in your device settings.',
        );
        setIsSaving(false);
        setShowSaveModal(false);
        return;
      }

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const filename = `product_image_${timestamp}.jpg`;

      // For Android, save to Downloads folder which is more reliable
      const downloadPath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${filename}`
          : `${RNFS.DocumentDirectoryPath}/${filename}`;

      console.log('Saving image to:', downloadPath);
      console.log('Image URL:', selectedImageUrl);

      // Download the image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: selectedImageUrl,
        toFile: downloadPath,
        progressDivider: 1,
        begin: res => {
          console.log('Download started:', res);
        },
        progress: res => {
          console.log('Download progress:', res);
        },
      }).promise;

      console.log('Download result:', downloadResult);

      if (downloadResult.statusCode === 200) {
        // Verify the file was created
        const fileExists = await RNFS.exists(downloadPath);
        console.log('File exists after download:', fileExists);

        if (fileExists) {
          const fileStats = await RNFS.stat(downloadPath);
          console.log('File stats:', fileStats);

          setIsSaving(false);
          setShowSaveModal(false);

          // Show success message
          setTimeout(() => {
            Alert.alert(
              'Success!',
              `Image saved to ${
                Platform.OS === 'android' ? 'Downloads' : 'device'
              } folder.`,
            );
          }, 500);
        } else {
          throw new Error('File was not created');
        }
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.statusCode}`,
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      setIsSaving(false);
      setShowSaveModal(false);

      setTimeout(() => {
        Alert.alert(
          'Error',
          `Failed to save image: ${
            error instanceof Error ? error.message : 'Unknown error'
          }. Please try again.`,
        );
      }, 500);
    }
  };
  const handleShare = async () => {
    if (!product) return;

    try {
      const message = `Check out this amazing product: ${
        product.title
      } - $${product.price.toFixed(2)}`;

      Alert.alert('Share Product', message, [{text: 'OK'}]);
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  // Legacy contact function - keeping for backward compatibility
  const handleContactSeller = () => {
    Alert.alert(
      'Contact Seller',
      `Would you like to contact ${
        product?.user?.email || 'the seller'
      } about this product?`,
      [
        {text: 'Cancel'},
        {
          text: 'Send Email',
          onPress: () => {
            Alert.alert('Email', `Contacting ${product?.user?.email}...`);
          },
        },
      ],
    );
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
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
    },
    imageScrollView: {
      flex: 1,
    },
    imageContainer: {
      width: screenWidth,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
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
    sellerContainer: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: 12,
    },
    sellerTitle: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginBottom: 8,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sellerText: {
      ...typography.body,
      marginLeft: 8,
      color: colors.text,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    shareButton: {
      backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    shareButtonText: {
      ...getFontStyle('semiBold', 16),
      marginLeft: 8,
      color: colors.text,
    },
    contactButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    contactButtonText: {
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
    // NEW UI ELEMENTS FROM REPO
    mapSection: {
      marginBottom: 20,
    },
    mapContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationIcon: {
      marginRight: 8,
    },
    locationText: {
      ...getFontStyle('medium', 16),
      color: colors.text,
      flex: 1,
    },
    contactSection: {
      marginBottom: 20,
    },
    contactCard: {
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    shareSection: {
      marginBottom: 20,
    },
    shareCard: {
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
    },
    enhancedButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
    },
    enhancedButtonSecondary: {
      backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
      borderWidth: 1,
      borderColor: colors.border,
    },
    enhancedButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
    enhancedButtonTextSecondary: {
      color: colors.text,
    },
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
    },
    infoText: {
      ...getFontStyle('regular', 12),
      color: colors.primary,
      marginLeft: 8,
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      ...getFontStyle('bold', 16),
      color: colors.primary,
    },
    statLabel: {
      ...getFontStyle('regular', 12),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      minWidth: 280,
      maxWidth: 320,
    },
    modalTitle: {
      ...getFontStyle('bold', 18),
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalMessage: {
      ...getFontStyle('regular', 16),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#333333' : '#E5E5E5',
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      ...getFontStyle('semiBold', 16),
    },
    cancelButtonText: {
      color: colors.text,
    },
    saveButtonText: {
      color: '#FFFFFF',
    },
    savingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    savingText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
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
        <Text style={{...typography.body, marginTop: 16, color: colors.text}}>
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

  const productImages = product.images || [];

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
            {productImages.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleImageScroll}
                  scrollEventThrottle={16}
                  style={styles.imageScrollView}>
                  {productImages.map((image, index) => (
                    <TouchableOpacity
                      key={image._id}
                      style={styles.imageContainer}
                      onLongPress={() =>
                        handleImageLongPress(getImageUrl(image.url))
                      }
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
                {productImages.length > 1 && (
                  <View style={styles.imageCounter}>
                    <Text style={styles.counterText}>
                      {currentImageIndex + 1} / {productImages.length}
                    </Text>
                  </View>
                )}

                {/* Dots Indicator */}
                {productImages.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {productImages.map(
                      (_: {_id: string; url: string}, index: number) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            index === currentImageIndex && styles.activeDot,
                          ]}
                        />
                      ),
                    )}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="image-off" size={40} color={colors.text} />
              </View>
            )}
          </View>

          {/* Content Section with Enhanced UI */}
          <View style={styles.contentContainer}>
            {/* Product Header */}
            <View style={styles.header}>
              <Text style={styles.title} testID="product-title">
                {product.title}
              </Text>
              <Text style={styles.price} testID="product-price">
                ${product.price.toFixed(2)}
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

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description} testID="product-description">
                {product.description}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Enhanced Location Map Section */}
            {product.location && (
              <View style={styles.mapSection}>
                <View style={styles.locationHeader}>
                  <Icon
                    name="map-marker"
                    size={24}
                    color={colors.primary}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <View style={[styles.mapContainer, styles.cardShadow]}>
                  <ProductLocationMap
                    location={product.location}
                    height={200}
                    showOpenInMapsButton={true}
                    productTitle={product.title}
                  />
                </View>
                <View style={styles.infoContainer}>
                  <Icon name="information" size={16} color={colors.primary} />
                  <Text style={styles.infoText}>
                    Tap the map to view directions and get more location details
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Enhanced Contact Seller Section (for non-owners) */}
            {!isOwner && (
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contact Seller</Text>
                <View style={[styles.contactCard, styles.cardShadow]}>
                  <ContactSeller product={product} />
                </View>
              </View>
            )}

            {/* Enhanced Product Sharing Section */}
            <View style={styles.shareSection}>
              <Text style={styles.sectionTitle}>Share This Product</Text>
              <View style={[styles.shareCard, styles.cardShadow]}>
                <ProductSharing product={product} />
              </View>
            </View>

            {/* Safety Information */}
            <View style={styles.infoContainer}>
              <Icon name="shield-check" size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                Always meet in a safe, public place when buying or selling items
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Save Image Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Save Image</Text>
            <Text style={styles.modalMessage}>
              Do you want to save this image to your device? It will be saved to
              your Downloads folder.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
                disabled={isSaving}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveImageToGallery}
                disabled={isSaving}>
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.savingText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetailsScreen;
