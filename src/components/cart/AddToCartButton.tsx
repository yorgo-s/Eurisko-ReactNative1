import React, {useContext, useState} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore} from '../../store/cartStore';
import {Product} from '../../api/products';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CartToast from './CartToast';

interface AddToCartButtonProps {
  product: Product;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  onAddToCart?: () => void;
  disabled?: boolean;
  showToast?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  size = 'medium',
  style,
  onAddToCart,
  disabled = false,
  showToast = true,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const {addToCart, isInCart, getCartItem, updateQuantity} = useCartStore();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isProductInCart = isInCart(product._id);
  const cartItem = getCartItem(product._id);

  const showToastMessage = (message: string) => {
    if (showToast) {
      setToastMessage(message);
      setToastVisible(true);
    }
  };

  const handleAddToCart = () => {
    if (isProductInCart && cartItem) {
      // If already in cart, increment quantity
      updateQuantity(product._id, cartItem.quantity + 1);
      showToastMessage(`Updated quantity to ${cartItem.quantity + 1}`);
    } else {
      // Add new item to cart
      addToCart(product, 1);
      showToastMessage(`${product.title} added to cart!`);
    }
    onAddToCart?.();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: 8,
          fontSize: 12,
          iconSize: 16,
          minWidth: 80,
        };
      case 'large':
        return {
          padding: 16,
          fontSize: 18,
          iconSize: 24,
          minWidth: 140,
        };
      default: // medium
        return {
          padding: 12,
          fontSize: 14,
          iconSize: 20,
          minWidth: 120,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    button: {
      backgroundColor: isProductInCart ? colors.primary : colors.primary,
      paddingVertical: sizeStyles.padding,
      paddingHorizontal: sizeStyles.padding + 4,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: sizeStyles.minWidth,
      opacity: disabled ? 0.6 : 1,
    },
    buttonInCart: {
      backgroundColor: colors.primary + 'CC', // Slightly transparent
    },
    buttonText: {
      ...getFontStyle('semiBold', sizeStyles.fontSize),
      color: '#FFFFFF',
      marginLeft: 6,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 6,
    },
    quantityText: {
      ...getFontStyle('bold', sizeStyles.fontSize - 2),
      color: '#FFFFFF',
    },
  });

  if (disabled) {
    return (
      <View style={[styles.button, {backgroundColor: colors.card}, style]}>
        <Icon name="cart-off" size={sizeStyles.iconSize} color={colors.text} />
        <Text style={[styles.buttonText, {color: colors.text}]}>
          Unavailable
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isProductInCart && styles.buttonInCart, style]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
        testID="add-to-cart-button">
        <Icon
          name={isProductInCart ? 'cart-check' : 'cart-plus'}
          size={sizeStyles.iconSize}
          color="#FFFFFF"
        />

        {isProductInCart && cartItem ? (
          <View style={styles.quantityContainer}>
            <Text style={styles.buttonText}>In Cart</Text>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.buttonText}>Add to Cart</Text>
        )}
      </TouchableOpacity>

      <CartToast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onHide={() => setToastVisible(false)}
      />
    </>
  );
};

export default AddToCartButton;
