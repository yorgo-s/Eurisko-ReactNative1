import {useState} from 'react';
import {Alert, Platform} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
  ImagePickerOptions,
} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export interface CameraImage {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

interface UseCameraOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowMultiple?: boolean;
  maxImages?: number;
}

export const useCamera = (options: UseCameraOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    quality = 0.8,
    maxWidth = 1200,
    maxHeight = 1200,
    allowMultiple = false,
    maxImages = 5,
  } = options;

  // Request camera permission
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  // Request photo library permission
  const requestLibraryPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      } else {
        // For Android 13+ (API level 33), we need READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          return result === RESULTS.GRANTED;
        } else {
          const result = await request(
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          );
          return result === RESULTS.GRANTED;
        }
      }
    } catch (error) {
      console.error('Library permission error:', error);
      return false;
    }
  };

  // Launch camera
  const openCamera = async (): Promise<CameraImage[]> => {
    setIsLoading(true);

    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take photos.',
          [{text: 'OK'}],
        );
        return [];
      }

      const options: ImagePickerOptions = {
        mediaType: 'photo' as MediaType,
        quality,
        maxWidth,
        maxHeight,
        includeBase64: false,
        saveToPhotos: false,
      };

      return new Promise(resolve => {
        launchCamera(options, (response: ImagePickerResponse) => {
          setIsLoading(false);

          if (response.didCancel || response.errorCode) {
            resolve([]);
            return;
          }

          if (response.assets && response.assets.length > 0) {
            const images: CameraImage[] = response.assets.map(
              (asset, index) => ({
                uri: asset.uri!,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `camera-${Date.now()}-${index}.jpg`,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
              }),
            );
            resolve(images);
          } else {
            resolve([]);
          }
        });
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      return [];
    }
  };

  // Launch image library
  const openLibrary = async (): Promise<CameraImage[]> => {
    setIsLoading(true);

    try {
      const hasPermission = await requestLibraryPermission();

      if (!hasPermission) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please allow photo library access to select images.',
          [{text: 'OK'}],
        );
        return [];
      }

      const options: ImagePickerOptions = {
        mediaType: 'photo' as MediaType,
        quality,
        maxWidth,
        maxHeight,
        includeBase64: false,
        selectionLimit: allowMultiple ? maxImages : 1,
      };

      return new Promise(resolve => {
        launchImageLibrary(options, (response: ImagePickerResponse) => {
          setIsLoading(false);

          if (response.didCancel || response.errorCode) {
            resolve([]);
            return;
          }

          if (response.assets && response.assets.length > 0) {
            const images: CameraImage[] = response.assets.map(
              (asset, index) => ({
                uri: asset.uri!,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `library-${Date.now()}-${index}.jpg`,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
              }),
            );
            resolve(images);
          } else {
            resolve([]);
          }
        });
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Library error:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
      return [];
    }
  };

  // Show image picker options
  const showImagePicker = (): Promise<CameraImage[]> => {
    return new Promise(resolve => {
      const options = [
        {text: 'Camera', onPress: () => openCamera().then(resolve)},
        {text: 'Photo Library', onPress: () => openLibrary().then(resolve)},
        {text: 'Cancel', style: 'cancel' as const, onPress: () => resolve([])},
      ];

      Alert.alert(
        'Select Image',
        'Choose how you want to select an image',
        options,
      );
    });
  };

  return {
    openCamera,
    openLibrary,
    showImagePicker,
    isLoading,
  };
};
