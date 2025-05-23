import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
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
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {useCreateProduct} from '../../hooks/useProducts';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import LocationPicker from '../../components/common/LocationPicker';

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
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [images, setImages] = useState<
    Array<{uri: string; type: string; name: string}>
  >([]);
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

  const onSubmit = (data: ProductFormData) => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    const productData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      location: JSON.stringify(data.location),
      images: images,
    };

    createProductMutation.mutate(productData, {
      onSuccess: () => {
        Alert.alert('Success', 'Product added successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      },
      onError: (error: any) => {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to add product',
        );
      },
    });
  };

  const handleSelectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose from where you want to select an image',
      [
        {text: 'Camera', onPress: () => selectImage(true)},
        {text: 'Gallery', onPress: () => selectImage(false)},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const selectImage = async (useCamera: boolean) => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 'high', // <-- fix: use 'low' | 'medium' | 'high'
      maxWidth: 1200,
      maxHeight: 1200,
    };

    try {
      const result: ImagePickerResponse = useCamera
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel || result.errorCode) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri!,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image-${Date.now()}.jpg`,
        }));

        if (images.length + newImages.length > 5) {
          Alert.alert('Error', 'You can only add up to 5 images');
          return;
        }

        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
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
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    imageBox: {
      width: 100,
      height: 100,
      backgroundColor: isDarkMode ? '#333333' : '#E0E0E0',
      borderRadius: 8,
      margin: 4,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    removeImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageButton: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView style={styles.content}>
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
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

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
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
        </View>

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
              />
            )}
          />
          {errors.price && (
            <Text style={styles.errorText}>{errors.price.message}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Images (up to 5)</Text>
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageBox}>
                <Image source={{uri: image.uri}} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}>
                  <Icon name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={[styles.imageBox, styles.addImageButton]}
                onPress={handleSelectImage}>
                <Icon name="plus" size={32} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => setShowLocationPicker(true)}>
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

        <TouchableOpacity
          style={[
            styles.submitButton,
            createProductMutation.isPending && {opacity: 0.7},
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={createProductMutation.isPending}>
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

          {/* <LocationPicker
            visible={showLocationPicker}
            onClose={() => setShowLocationPicker(false)}
            onLocationSelect={location => {
              setValue('location', location);
              setShowLocationPicker(false);
            }}
            initialLocation={watch('location')}
            title="Choose Product Location"
          /> */}

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
                  />
                )}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleLocationConfirm}>
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AddProductScreen;
