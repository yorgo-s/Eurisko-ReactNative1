// src/components/products/ProductSharing.tsx
// Replace the existing ProductSharing component with this updated version

import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Share as RNShare,
  Clipboard,
  AlertButton,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../api/products';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProductSharingProps {
  product: Product;
  onShareComplete?: () => void;
}

// Main ProductSharing component
const ProductSharing: React.FC<ProductSharingProps> = ({
  product,
  onShareComplete,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Function to get full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  // Generate product URL (deep link)
  const generateProductUrl = () => {
    // Generate both custom scheme and HTTPS deep links
    return {
      customScheme: `awesomeshop://product/${product._id}`,
      httpsLink: `https://awesomeshop.app/product/${product._id}`,
      webFallback: `https://awesomeshop.app/product/${product._id}`, // Could be your actual website
    };
  };

  // Create share message
  const createShareMessage = () => {
    const urls = generateProductUrl();
    const message =
      `Check out this amazing product!\n\n` +
      `📱 ${product.title}\n` +
      `💰 $${product.price.toFixed(2)}\n` +
      `📝 ${product.description.substring(0, 100)}${
        product.description.length > 100 ? '...' : ''
      }\n\n` +
      `Open in app: ${urls.customScheme}\n` +
      `View online: ${urls.httpsLink}`;

    return message;
  };

  // Handle general sharing using React Native's built-in Share API
  const handleShare = async () => {
    try {
      const message = createShareMessage();

      const result = await RNShare.share({
        message: message,
        title: `${product.title} - $${product.price.toFixed(2)}`,
        // On iOS, you can also share a URL separately
        url:
          product.images && product.images.length > 0
            ? getImageUrl(product.images[0].url)
            : undefined,
      });

      if (result.action === RNShare.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity:', result.activityType);
        } else {
          // Shared
          console.log('Product shared successfully');
        }
        onShareComplete?.();
      } else if (result.action === RNShare.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share product');
    }
  };

  // Handle copy link
  const handleCopyLink = () => {
    const message = createShareMessage();

    // Copy to clipboard
    Clipboard.setString(message);

    Alert.alert(
      'Copied!',
      'Product details and deep links have been copied to clipboard',
      [{text: 'OK'}],
    );
  };

  // Show sharing options
  const showSharingOptions = () => {
    const options: AlertButton[] = [
      {text: 'Share', onPress: handleShare},
      {text: 'Copy Link', onPress: handleCopyLink},
      {text: 'Cancel', style: 'cancel'},
    ];

    Alert.alert(
      'Share Product',
      'Choose how you want to share this product',
      options,
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      marginVertical: 8,
    },
    shareButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    shareButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
    moreButton: {
      backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Main Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Icon name="share-variant" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share Product</Text>
      </TouchableOpacity>

      {/* More Options Button */}
      <TouchableOpacity style={styles.moreButton} onPress={showSharingOptions}>
        <Icon name="dots-horizontal" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

// Quick Share Bar Component (simplified version)
export const QuickShareBar: React.FC<ProductSharingProps> = ({
  product,
  onShareComplete,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Simple share handler
  const handleQuickShare = async () => {
    try {
      const urls = {
        customScheme: `awesomeshop://product/${product._id}`,
        httpsLink: `https://awesomeshop.app/product/${product._id}`,
      };

      const message =
        `Check out this product: ${product.title} - $${product.price.toFixed(
          2,
        )}\n\n` +
        `Open in app: ${urls.customScheme}\n` +
        `View online: ${urls.httpsLink}`;

      const result = await RNShare.share({
        message: message,
        title: product.title,
      });

      if (result.action === RNShare.sharedAction) {
        onShareComplete?.();
      }
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share product');
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    title: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    shareButton: {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Love this product? Share it!</Text>
      <TouchableOpacity style={styles.shareButton} onPress={handleQuickShare}>
        <Icon name="share-variant" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Quick Share</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductSharing;
