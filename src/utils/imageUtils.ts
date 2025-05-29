import Config from 'react-native-config';

// Get base URL from environment configuration
const API_BASE_URL =
  Config.API_BASE_URL || 'https://backend-practice.eurisko.me';

/**
 * Converts a relative image URL to a full URL
 * @param relativeUrl - The relative URL from the API
 * @returns Full image URL or empty string if no URL provided
 */
export const getFullImageUrl = (relativeUrl: string | undefined): string => {
  if (!relativeUrl) {
    return ''; // Return empty string if no URL provided
  }

  // Check if the URL is already absolute (starts with http or https)
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }

  // Otherwise, prepend the base URL
  return `${API_BASE_URL}${relativeUrl}`;
};

/**
 * Validates image file size against the configured maximum
 * @param fileSizeBytes - File size in bytes
 * @returns true if file size is within limits
 */
export const isValidImageSize = (fileSizeBytes: number): boolean => {
  const maxSizeMB = parseInt(Config.MAX_IMAGE_SIZE_MB || '5', 10);
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  return fileSizeBytes <= maxSizeBytes;
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets the maximum number of images allowed per product
 * @returns Maximum number of images
 */
export const getMaxImagesPerProduct = (): number => {
  return parseInt(Config.MAX_IMAGES_PER_PRODUCT || '5', 10);
};

/**
 * Validates image count against the configured maximum
 * @param currentCount - Current number of images
 * @returns true if count is within limits
 */
export const isValidImageCount = (currentCount: number): boolean => {
  return currentCount <= getMaxImagesPerProduct();
};

/**
 * Gets image validation error message
 * @param fileSizeBytes - File size in bytes
 * @param currentImageCount - Current number of images
 * @returns Error message or null if valid
 */
export const getImageValidationError = (
  fileSizeBytes?: number,
  currentImageCount?: number,
): string | null => {
  if (
    currentImageCount !== undefined &&
    !isValidImageCount(currentImageCount)
  ) {
    return `Maximum ${getMaxImagesPerProduct()} images allowed`;
  }

  if (fileSizeBytes !== undefined && !isValidImageSize(fileSizeBytes)) {
    const maxSizeMB = Config.MAX_IMAGE_SIZE_MB || '5';
    return `Image size must be less than ${maxSizeMB}MB`;
  }

  return null;
};

// Log configuration in development
if (Config.DEBUG_MODE === 'true' && __DEV__) {
  console.log('🖼️ Image Configuration:', {
    baseURL: API_BASE_URL,
    maxSizeMB: Config.MAX_IMAGE_SIZE_MB,
    maxImages: Config.MAX_IMAGES_PER_PRODUCT,
  });
}
