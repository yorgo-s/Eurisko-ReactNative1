// src/components/products/ProductSharing.tsx

import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Share from 'react-native-share';
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

  // Generate product URL (in a real app, this would be your deep link)
  const generateProductUrl = () => {
    return `https://yourapp.com/products/${product._id}`;
  };

  // Create rich share message
  const createShareMessage = () => {
    const url = generateProductUrl();
    const message =
      `Check out this amazing product!\n\n` +
      `📱 ${product.title}\n` +
      `💰 $${product.price.toFixed(2)}\n` +
      `📝 ${product.description.substring(0, 100)}${
        product.description.length > 100 ? '...' : ''
      }\n\n` +
      `View details: ${url}`;

    return message;
  };

  // Handle general sharing
  const handleShare = async () => {
    try {
      const message = createShareMessage();
      const imageUrl =
        product.images && product.images.length > 0
          ? getImageUrl(product.images[0].url)
          : undefined;

      const shareOptions = {
        title: `${product.title} - $${product.price.toFixed(2)}`,
        message: message,
        url: imageUrl,
        failOnCancel: false,
      };

      const result = await Share.open(shareOptions);

      if (result.success) {
        onShareComplete?.();
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error);
        Alert.alert('Error', 'Failed to share product');
      }
    }
  };

  // Show sharing options
  const showSharingOptions = () => {
    Alert.alert('Share Product', 'Choose how you want to share this product', [
      {text: 'Share', onPress: handleShare},
      {text: 'Cancel', style: 'cancel'},
    ]);
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
      const message = `Check out this product: ${
        product.title
      } - $${product.price.toFixed(2)}`;

      const shareOptions = {
        title: product.title,
        message: message,
        failOnCancel: false,
      };

      const result = await Share.open(shareOptions);

      if (result.success) {
        onShareComplete?.();
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error);
        Alert.alert('Error', 'Failed to share product');
      }
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
      <Text style={styles.title}>Share this product</Text>
      <TouchableOpacity style={styles.shareButton} onPress={handleQuickShare}>
        <Icon name="share-variant" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share Product</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductSharing;
