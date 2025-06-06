// src/screens/products/AddProductScreen.tsx - UPDATED with Push Notifications
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useCreateProduct} from '../../hooks/useProducts';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import ImagePickerComponent from '../../components/common/ImagePicker';
import {CameraImage} from '../../hooks/useCamera';
import notificationService from '../../utils/notificationService';

// Validation schema
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(
      value => !isNaN(Number(value)) && Number(value) > 0,
      'Price must be a positive number',
    ),
  location: z.object({
    name: z.string().min(1, 'Location name is required'),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

const AddProductScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [images, setImages] = useState<CameraImage[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 33.8547,
    longitude: 35.8623,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      location: {
        name: '',
        latitude: 33.8547,
        longitude: 35.8623,
      },
    },
  });

  const selectedLocation = watch('location');
  const createProductMutation = useCreateProduct();

  // UPDATED: Enhanced onSubmit with push notifications
  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    // Convert CameraImage[] to the format expected by the API
    const formattedImages = images.map(image => ({
      uri: image.uri,
      type: image.type,
      fileName: image.name,
    }));

    const productData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      location: JSON.stringify(data.location),
      images: formattedImages,
    };

    createProductMutation.mutate(productData, {
      onSuccess: async response => {
        console.log('✅ Product created successfully:', response);

        // NEW: Send push notification after successful product creation
        if (response.success && response.data) {
          console.log('📤 Sending product notification...');

          notificationService();

          Alert.alert('Success', 'Product added successfully!', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      },
      onError: (error: any) => {
        console.error('❌ Error creating product:', error);
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to add product',
        );
      },
    });

    // NOTE: Push notifications will be sent automatically by the app
    // The backend doesn't need to handle this since we're using OneSignal
    //     } catch (error) {
    //       console.error('❌ Error in success handler:', error);
    //       Alert.alert('Success', 'Product added successfully!', [
    //         {text: 'OK', onPress: () => navigation.goBack()},
    //       ]);
    //     }
    //   },
    //   onError: (error: any) => {
    //     console.error('❌ Error creating product:', error);
    //     Alert.alert(
    //       'Error',
    //       error.response?.data?.message || 'Failed to add product',
    //     );
    //   },
    // });
  };

  const handleMapPress = (event: any) => {
    const {coordinate} = event.nativeEvent;
    setValue('location.latitude' as any, coordinate.latitude);
    setValue('location.longitude' as any, coordinate.longitude);
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const handleLocationConfirm = () => {
    if (!selectedLocation.name) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }
    setShowLocationPicker(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: Math.max(16, insets.top),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...getFontStyle('bold', 20),
      color: colors.text,
      marginLeft: 16,
    },
    content: {
      padding: 16,
    },
    formSection: {
      marginBottom: 20,
    },
    label: {
      ...getFontStyle('medium', 16),
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      borderRadius: 8,
      padding: 12,
      ...getFontStyle('regular', 16),
      color: colors.text,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputError: {
      borderColor: colors.error,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      ...getFontStyle('regular', 14),
      color: colors.error,
      marginTop: 4,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    locationText: {
      ...getFontStyle('regular', 16),
      color: colors.text,
      flex: 1,
      marginLeft: 8,
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    submitButtonText: {
      ...getFontStyle('semiBold', 18),
      color: '#FFFFFF',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...getFontStyle('bold', 18),
      color: colors.text,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    locationInputContainer: {
      position: 'absolute',
      top: 80,
      left: 16,
      right: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    locationNameInput: {
      ...getFontStyle('regular', 16),
      color: colors.text,
    },
    confirmButton: {
      position: 'absolute',
      bottom: 30,
      left: 16,
      right: 16,
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    imagesSection: {
      marginBottom: 20,
    },
    imagesSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    imageCountBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
    },
    imageCountText: {
      ...getFontStyle('semiBold', 12),
      color: '#FFFFFF',
    },
    requirementText: {
      ...getFontStyle('regular', 12),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginTop: 4,
      fontStyle: 'italic',
    },
    // NEW: Notification status indicator
    notificationSection: {
      backgroundColor: colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: {
      ...getFontStyle('semiBold', 14),
      color: colors.primary,
      marginLeft: 8,
    },
    notificationText: {
      ...getFontStyle('regular', 12),
      color: colors.text,
      lineHeight: 18,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* NEW: Notification Info Section */}
        <View style={styles.notificationSection}>
          <View style={styles.notificationHeader}>
            <Icon name="bell-ring" size={16} color={colors.primary} />
            <Text style={styles.notificationTitle}>Push Notifications</Text>
          </View>
          <Text style={styles.notificationText}>
            When you add this product, all app users will receive a push
            notification with a direct link to view your product.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({field: {value, onChange}}) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter product title"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={value}
                onChangeText={onChange}
                maxLength={100}
                testID="title-input"
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({field: {value, onChange}}) => (
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Enter product description"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                maxLength={500}
                testID="description-input"
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
        </View>

        {/* Price Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Price ($)</Text>
          <Controller
            control={control}
            name="price"
            render={({field: {value, onChange}}) => (
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="Enter price"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                testID="price-input"
              />
            )}
          />
          {errors.price && (
            <Text style={styles.errorText}>{errors.price.message}</Text>
          )}
        </View>

        {/* Images Section */}
        <View style={styles.formSection}>
          <View style={styles.imagesSectionHeader}>
            <Text style={styles.label}>Product Images</Text>
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>{images.length}/5</Text>
            </View>
          </View>
          <Text style={styles.requirementText}>
            Add at least 1 image (up to 5 images allowed)
          </Text>

          <ImagePickerComponent
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            allowMultiple={true}
            imageSize={100}
            title=""
            showImageCount={false}
          />
        </View>

        {/* Location Section */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => setShowLocationPicker(true)}
            testID="location-button">
            <Icon name="map-marker" size={24} color={colors.primary} />
            <Text style={styles.locationText}>
              {selectedLocation.name || 'Choose location from map'}
            </Text>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
          {errors.location?.name && (
            <Text style={styles.errorText}>{errors.location.name.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createProductMutation.isPending && {opacity: 0.7},
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={createProductMutation.isPending}
          testID="submit-button">
          {createProductMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Location</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton>
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                draggable
                onDragEnd={handleMapPress}
              />
            </MapView>

            <View style={styles.locationInputContainer}>
              <Controller
                control={control}
                name="location.name"
                render={({field: {value, onChange}}) => (
                  <TextInput
                    style={styles.locationNameInput}
                    placeholder="Enter location name"
                    placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                    value={value}
                    onChangeText={onChange}
                    testID="location-name-input"
                  />
                )}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleLocationConfirm}
              testID="confirm-location-button">
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AddProductScreen;
