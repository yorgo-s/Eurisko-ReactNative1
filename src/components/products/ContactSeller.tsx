import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../api/products';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ContactSellerProps {
  product: Product;
  onContactComplete?: () => void;
}

const ContactSeller: React.FC<ContactSellerProps> = ({
  product,
  onContactComplete,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Generate email subject and body
  const generateEmailContent = () => {
    const subject = `Inquiry about: ${product.title}`;
    const body =
      `Hi,\n\n` +
      `I'm interested in your product "${
        product.title
      }" listed for $${product.price.toFixed(2)}.\n\n` +
      `Product Details:\n` +
      `- Title: ${product.title}\n` +
      `- Price: $${product.price.toFixed(2)}\n` +
      `- Description: ${product.description.substring(0, 200)}${
        product.description.length > 200 ? '...' : ''
      }\n\n` +
      `Could you please provide more information?\n\n` +
      `Thank you!\n\n` +
      `Best regards`;

    return {subject, body};
  };

  // Handle email contact
  const handleEmailContact = async () => {
    try {
      const {subject, body} = generateEmailContent();
      const emailUrl = `mailto:${
        product.user?.email || ''
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body,
      )}`;

      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        onContactComplete?.();
      } else {
        Alert.alert(
          'Email Not Available',
          'No email app is available on this device. You can manually send an email to:\n\n' +
            (product.user?.email || 'No email provided'),
          [
            {text: 'OK'},
            {
              text: 'Copy Email',
              onPress: () => {
                // In a real app, you'd copy to clipboard here
                Alert.alert(
                  'Email Address',
                  product.user?.email || 'No email provided',
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Email contact error:', error);
      Alert.alert('Error', 'Failed to open email app');
    }
  };

  // Handle phone contact (if phone number was available)
  const handlePhoneContact = () => {
    Alert.alert(
      'Contact Seller',
      'Phone contact feature will be available when sellers provide phone numbers.',
      [{text: 'OK'}],
    );
  };

  // Handle message contact
  const handleMessageContact = () => {
    const {subject} = generateEmailContent();
    Alert.alert(
      'Send Message',
      'Would you like to send a message to the seller?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send Email', onPress: handleEmailContact},
      ],
    );
  };

  // Get seller initials for avatar
  const getSellerInitials = () => {
    const email = product.user?.email || '';
    if (email.length === 0) return '?';

    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  // Get seller display name
  const getSellerDisplayName = () => {
    const email = product.user?.email || 'Unknown Seller';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      ...getFontStyle('bold', 18),
      color: '#FFFFFF',
    },
    sellerInfo: {
      flex: 1,
    },
    sellerName: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginBottom: 2,
    },
    sellerEmail: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 4,
    },
    verifiedText: {
      ...getFontStyle('medium', 10),
      color: colors.primary,
      marginLeft: 2,
    },
    title: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginBottom: 12,
    },
    contactOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    contactButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      ...getFontStyle('semiBold', 14),
      marginLeft: 8,
    },
    primaryButtonText: {
      color: '#FFFFFF',
    },
    secondaryButtonText: {
      color: colors.text,
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
  });

  return (
    <View style={styles.container}>
      {/* Seller Information */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getSellerInitials()}</Text>
        </View>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{getSellerDisplayName()}</Text>
          <Text style={styles.sellerEmail} numberOfLines={1}>
            {product.user?.email || 'No email provided'}
          </Text>
          {/* <View style={styles.verifiedBadge}>
            <Icon name="check-decagram" size={12} color={colors.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View> */}
        </View>
      </View>

      {/* Contact Title */}
      <Text style={styles.title}>Contact Seller</Text>

      {/* Contact Options */}
      <View style={styles.contactOptions}>
        <TouchableOpacity
          style={[styles.contactButton, styles.primaryButton]}
          onPress={handleEmailContact}>
          <Icon name="email" size={18} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, styles.secondaryButton]}
          onPress={handleMessageContact}>
          <Icon name="message-text" size={18} color={colors.text} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Message
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, styles.secondaryButton]}
          onPress={handlePhoneContact}>
          <Icon name="phone" size={18} color={colors.text} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Call
          </Text>
        </TouchableOpacity>
      </View>

      {/* Information Notice */}
      <View style={styles.infoContainer}>
        <Icon name="information" size={16} color={colors.primary} />
        <Text style={styles.infoText}>
          Always meet in a safe, public place when buying or selling items.
        </Text>
      </View>

      {/* Seller Stats (placeholder for future features) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );
};

export default ContactSeller;
