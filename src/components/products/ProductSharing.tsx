// src/components/products/ProductSharing.tsx
// REPLACE THIS ENTIRE FILE WITH THE CODE BELOW

import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Share as RNShare,
  AlertButton,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../api/products';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProductSharingProps {
  product: Product;
  onShareComplete?: () => void;
}

// Helper functions to generate links (FIXED: Moved out of DeepLinkManager)
const generateProductLink = (productId: string): string => {
  return `awesomeshop://product/${productId}`;
};

const generateHTTPSProductLink = (productId: string): string => {
  return `https://awesomeshop.app/product/${productId}`;
};

// Main ProductSharing component
const ProductSharing: React.FC<ProductSharingProps> = ({
  product,
  onShareComplete,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Generate product URLs (FIXED: Don't use DeepLinkManager here)
  const generateProductUrls = () => {
    return {
      customScheme: generateProductLink(product._id),
      httpsLink: generateHTTPSProductLink(product._id),
      webFallback: `https://awesomeshop.app/product/${product._id}`,
    };
  };

  // Create comprehensive share message
  const createShareMessage = () => {
    const urls = generateProductUrls();
    const message =
      `🛒 Check out this amazing product!\n\n` +
      `📱 ${product.title}\n` +
      `💰 $${product.price.toFixed(2)}\n` +
      `📝 ${product.description.substring(0, 100)}${
        product.description.length > 100 ? '...' : ''
      }\n\n` +
      `🔗 Open in app: ${urls.customScheme}\n` +
      `🌐 View online: ${urls.httpsLink}\n\n` +
      `Download AwesomeShop to see more amazing products!`;

    return {
      message,
      urls,
    };
  };

  // Handle general sharing (FIXED: Better error handling and platform-specific options)
  const handleShare = async () => {
    try {
      const {message, urls} = createShareMessage();

      const shareOptions: any = {
        title: `${product.title} - $${product.price.toFixed(2)}`,
        message: message,
      };

      // Only add URL for iOS
      if (Platform.OS === 'ios') {
        shareOptions.url = urls.httpsLink;
      }

      const result = await RNShare.share(shareOptions);

      if (result.action === RNShare.sharedAction) {
        if (result.activityType) {
          console.log('✅ Shared with activity:', result.activityType);
        } else {
          console.log('✅ Product shared successfully');
        }

        // Alert.alert(
        //   'Shared Successfully!',
        //   'Product link has been shared. Recipients can tap the link to view the product.',
        //   [{text: 'OK'}],
        // );

        onShareComplete?.();
      } else if (result.action === RNShare.dismissedAction) {
        console.log('ℹ️ Share dismissed');
      }
    } catch (error: any) {
      console.error('❌ Share error:', error);
      Alert.alert(
        'Share Failed',
        'Unable to share the product. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  // Handle copy link (FIXED: Safer implementation)
  const handleCopyLink = async () => {
    try {
      const {urls} = createShareMessage();

      const copyMessage = urls.httpsLink;

      await Clipboard.setString(copyMessage);

      Alert.alert(
        'Link Copied!',
        'Product links have been copied to your clipboard.',
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('❌ Copy error:', error);
      Alert.alert('Copy Failed', 'Unable to copy the link. Please try again.', [
        {text: 'OK'},
      ]);
    }
  };

  // Show sharing options
  const showSharingOptions = () => {
    const options: AlertButton[] = [
      {text: 'Share via Apps', onPress: handleShare},
      {text: 'Copy Links', onPress: handleCopyLink},
      {text: 'Cancel', style: 'cancel'},
    ];

    Alert.alert(
      'Share Product',
      'Choose how you want to share this product:',
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
  });

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-variant" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={showSharingOptions}>
          <Icon name="dots-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Icon name="information" size={16} color={colors.primary} />
        <Text style={styles.infoText}>
          Share links that open directly in the app for the best experience!
        </Text>
      </View>
    </View>
  );
};

export default ProductSharing;
