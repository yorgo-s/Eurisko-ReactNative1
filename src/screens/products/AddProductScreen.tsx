// import React, {useContext, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {ThemeContext} from '../../context/ThemeContext';
// import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useForm, Controller} from 'react-hook-form';
// import {z} from 'zod';
// import {zodResolver} from '@hookform/resolvers/zod';
// import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
// import {useMutation} from '@tanstack/react-query';
// import {productsApi} from '../../api/products';
// import {queryClient} from '../../api/queryClient';
// import SimpleLocationPicker from '../../components/products/SimpleLocationPicker';

// // Define validation schema with Zod
// const productSchema = z.object({
//   title: z.string().min(3, 'Title must be at least 3 characters'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   price: z
//     .string()
//     .min(1, 'Price is required')
//     .refine(
//       value => !isNaN(Number(value)) && Number(value) > 0,
//       'Price must be a positive number',
//     ),
//   location: z.object({
//     name: z.string().min(1, 'Location name is required'),
//     latitude: z.number(),
//     longitude: z.number(),
//   }),
// });

// const [showLocationPicker, setShowLocationPicker] = useState(false);

// type ProductFormData = z.infer<typeof productSchema>;

// const AddProductScreen = () => {
//   const navigation = useNavigation();
//   const {colors, isDarkMode, typography, getFontStyle} =
//     useContext(ThemeContext);
//   const insets = useSafeAreaInsets();

//   // State for selected images
//   const [images, setImages] = useState<
//     Array<{uri: string; type: string; name: string}>
//   >([]);

//   // Using React Hook Form with zod validation
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: {errors},
//   } = useForm<ProductFormData>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       price: '',
//       location: {
//         name: 'Dummy Place', // Default location for now
//         latitude: 33.56789,
//         longitude: 35.12345,
//       },
//     },
//   });

//   // Mutation for creating a product
//   const {mutate, isPending} = useMutation({
//     mutationFn: (data: {
//       title: string;
//       description: string;
//       price: number;
//       location: string;
//       images: Array<{uri: string; type: string; name: string}>;
//     }) => productsApi.createProduct(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({queryKey: ['products']});
//       Alert.alert('Success', 'Product added successfully!');
//       navigation.goBack();
//     },
//     onError: (error: any) => {
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to add product',
//       );
//     },
//   });

//   // Handle form submission
//   const onSubmit = (data: ProductFormData) => {
//     if (images.length === 0) {
//       Alert.alert('Error', 'Please add at least one image');
//       return;
//     }

//     // Format the data for API submission
//     const productData = {
//       title: data.title,
//       description: data.description,
//       price: Number(data.price),
//       location: JSON.stringify(data.location),
//       images: images,
//     };

//     // Submit the product
//     mutate(productData);
//   };

//   // Handle image selection
//   const handleSelectImage = async (useCamera = false) => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//       maxWidth: 1200,
//       maxHeight: 1200,
//     };

//     try {
//       const result = useCamera
//         ? await launchCamera(options)
//         : await launchImageLibrary(options);

//       if (result.didCancel) {
//         return;
//       }

//       if (result.errorCode) {
//         Alert.alert('Error', result.errorMessage || 'Failed to select image');
//         return;
//       }

//       if (result.assets && result.assets.length > 0) {
//         const newImages = result.assets.map(asset => ({
//           uri: asset.uri!,
//           type: asset.type || 'image/jpeg',
//           name: asset.fileName || `image-${Date.now()}.jpg`,
//         }));

//         // Don't exceed 5 images
//         if (images.length + newImages.length > 5) {
//           Alert.alert('Error', 'You can only add up to 5 images');
//           return;
//         }

//         setImages([...images, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Image selection error:', error);
//       Alert.alert('Error', 'Failed to select image');
//     }
//   };

//   // Handle removing an image
//   const handleRemoveImage = (index: number) => {
//     const newImages = [...images];
//     newImages.splice(index, 1);
//     setImages(newImages);
//   };

//   // Handle selecting location
//   const handleSelectLocation = () => {
//     setShowLocationPicker(true);
//   };
//   const handleLocationSelected = (selectedLocation: {
//     name: string;
//     latitude: number;
//     longitude: number;
//   }) => {
//     setValue('location', selectedLocation, {shouldValidate: true});
//     setShowLocationPicker(false);
//   };

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 16,
//       paddingTop: Math.max(16, insets.top),
//       borderBottomWidth: 1,
//       borderBottomColor: colors.border,
//     },
//     headerTitle: {
//       ...getFontStyle('bold', 22),
//       color: colors.text,
//       marginLeft: 16,
//     },
//     content: {
//       padding: 16,
//     },
//     formSection: {
//       marginBottom: 20,
//     },
//     sectionTitle: {
//       ...getFontStyle('semiBold', 18),
//       color: colors.text,
//       marginBottom: 12,
//     },
//     label: {
//       ...getFontStyle('medium', 16),
//       color: colors.text,
//       marginBottom: 8,
//     },
//     input: {
//       backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
//       borderRadius: 8,
//       padding: 12,
//       fontSize: 16,
//       color: colors.text,
//       borderWidth: 1,
//       borderColor: errors.title ? colors.error : 'transparent',
//       marginBottom: 4,
//     },
//     textArea: {
//       minHeight: 100,
//       textAlignVertical: 'top',
//     },
//     errorText: {
//       ...getFontStyle('regular', 14),
//       color: colors.error,
//       marginBottom: 8,
//     },
//     imagesContainer: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       marginBottom: 16,
//     },
//     imageBox: {
//       width: 100,
//       height: 100,
//       backgroundColor: isDarkMode ? '#333333' : '#E0E0E0',
//       borderRadius: 8,
//       margin: 4,
//       justifyContent: 'center',
//       alignItems: 'center',
//       overflow: 'hidden',
//     },
//     image: {
//       width: '100%',
//       height: '100%',
//       borderRadius: 8,
//     },
//     removeImageButton: {
//       position: 'absolute',
//       top: 4,
//       right: 4,
//       backgroundColor: 'rgba(0, 0, 0, 0.6)',
//       borderRadius: 12,
//       width: 24,
//       height: 24,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     addImageIcon: {
//       color: isDarkMode ? '#AAAAAA' : '#666666',
//     },
//     imageButtonsContainer: {
//       flexDirection: 'row',
//       marginBottom: 16,
//     },
//     imageButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: isDarkMode ? colors.card : '#F0F0F0',
//       padding: 12,
//       borderRadius: 8,
//       marginRight: 12,
//     },
//     imageButtonText: {
//       ...getFontStyle('medium', 15),
//       color: colors.text,
//       marginLeft: 8,
//     },
//     locationContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
//       padding: 12,
//       borderRadius: 8,
//       marginBottom: 16,
//     },
//     locationText: {
//       ...getFontStyle('regular', 16),
//       color: colors.text,
//       flex: 1,
//       marginLeft: 8,
//     },
//     submitButton: {
//       backgroundColor: colors.primary,
//       padding: 16,
//       borderRadius: 8,
//       alignItems: 'center',
//       marginTop: 20,
//       marginBottom: 40,
//     },
//     submitButtonText: {
//       ...getFontStyle('semiBold', 18),
//       color: '#FFFFFF',
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Add Product</Text>
//       </View>

//       <ScrollView style={styles.content}>
//         <View style={styles.formSection}>
//           <Text style={styles.label}>Title</Text>
//           <Controller
//             control={control}
//             name="title"
//             render={({field: {value, onChange}}) => (
//               <TextInput
//                 style={[
//                   styles.input,
//                   errors.title && {borderColor: colors.error},
//                 ]}
//                 placeholder="Enter product title"
//                 placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
//                 value={value}
//                 onChangeText={onChange}
//                 maxLength={100}
//               />
//             )}
//           />
//           {errors.title && (
//             <Text style={styles.errorText}>{errors.title.message}</Text>
//           )}
//         </View>

//         <View style={styles.formSection}>
//           <Text style={styles.label}>Description</Text>
//           <Controller
//             control={control}
//             name="description"
//             render={({field: {value, onChange}}) => (
//               <TextInput
//                 style={[
//                   styles.input,
//                   styles.textArea,
//                   errors.description && {borderColor: colors.error},
//                 ]}
//                 placeholder="Enter product description"
//                 placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
//                 value={value}
//                 onChangeText={onChange}
//                 multiline
//                 numberOfLines={5}
//                 maxLength={500}
//               />
//             )}
//           />
//           {errors.description && (
//             <Text style={styles.errorText}>{errors.description.message}</Text>
//           )}
//         </View>

//         <View style={styles.formSection}>
//           <Text style={styles.label}>Price</Text>
//           <Controller
//             control={control}
//             name="price"
//             render={({field: {value, onChange}}) => (
//               <TextInput
//                 style={[
//                   styles.input,
//                   errors.price && {borderColor: colors.error},
//                 ]}
//                 placeholder="Enter price"
//                 placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
//                 value={value}
//                 onChangeText={onChange}
//                 keyboardType="numeric"
//               />
//             )}
//           />
//           {errors.price && (
//             <Text style={styles.errorText}>{errors.price.message}</Text>
//           )}
//         </View>

//         <View style={styles.formSection}>
//           <Text style={styles.sectionTitle}>Images</Text>
//           <Text style={[styles.label, {marginBottom: 12}]}>
//             Add up to 5 images of your product
//           </Text>

//           <View style={styles.imagesContainer}>
//             {images.map((image, index) => (
//               <View key={index} style={styles.imageBox}>
//                 <Image source={{uri: image.uri}} style={styles.image} />
//                 <TouchableOpacity
//                   style={styles.removeImageButton}
//                   onPress={() => handleRemoveImage(index)}>
//                   <Icon name="close" size={16} color="#FFFFFF" />
//                 </TouchableOpacity>
//               </View>
//             ))}

//             {images.length < 5 && (
//               <TouchableOpacity
//                 style={styles.imageBox}
//                 onPress={() => handleSelectImage(false)}>
//                 <Icon name="plus" size={40} style={styles.addImageIcon} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <View style={styles.imageButtonsContainer}>
//             <TouchableOpacity
//               style={styles.imageButton}
//               onPress={() => handleSelectImage(false)}>
//               <Icon name="image" size={22} color={colors.primary} />
//               <Text style={styles.imageButtonText}>Gallery</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.imageButton}
//               onPress={() => handleSelectImage(true)}>
//               <Icon name="camera" size={22} color={colors.primary} />
//               <Text style={styles.imageButtonText}>Camera</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.formSection}>
//           <Text style={styles.sectionTitle}>Location</Text>
//           <TouchableOpacity
//             style={styles.locationContainer}
//             onPress={handleSelectLocation}>
//             <Icon name="map-marker" size={24} color={colors.primary} />
//             <Text style={styles.locationText}>
//               {`${control._formValues.location.name} (Dummy Location)`}
//             </Text>
//             <Icon name="chevron-right" size={24} color={colors.text} />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[styles.submitButton, isPending && {opacity: 0.7}]}
//           onPress={handleSubmit(onSubmit)}
//           disabled={isPending}>
//           {isPending ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.submitButtonText}>Add Product</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       {showLocationPicker && (
//         <SimpleLocationPicker
//           visible={showLocationPicker}
//           initialLocation={control._formValues.location}
//           onLocationSelected={handleLocationSelected}
//           onClose={() => setShowLocationPicker(false)}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default AddProductScreen;
