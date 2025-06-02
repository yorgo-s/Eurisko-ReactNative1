import React, {useContext, useState, useRef, useEffect} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore} from '../../store/cartStore';
import {Product} from '../../api/products';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CartToast from './CartToast';
import {
  scaleAnimation,
  pulseAnimation,
  buttonPressAnimation,
} from '../../utils/animationUtils';

interface AnimatedAddToCartButtonProps {
  product: Product;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  onAddToCart?: () => void;
  disabled?: boolean;
  showToast?: boolean;
}

const AnimatedAddToCartButton: React.FC<AnimatedAddToCartButtonProps> = ({
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  const isProductInCart = isInCart(product._id);
  const cartItem = getCartItem(product._id);

  // Button press animations
  const {pressIn, pressOut} = buttonPressAnimation(scaleValue, 0.95, 100);

  // Start pulse animation for items in cart
  useEffect(() => {
    if (isProductInCart && cartItem) {
      pulseAnimation(pulseValue, 1, 1.05, 2000).start();
    } else {
      pulseValue.setValue(1);
    }
  }, [isProductInCart, cartItem, pulseValue]);

  // Animate quantity badge when it changes
  useEffect(() => {
    if (cartItem) {
      Animated.sequence([
        scaleAnimation(badgeScale, 1.3, 150),
        scaleAnimation(badgeScale, 1, 150),
      ]).start();
    }
  }, [cartItem?.quantity, badgeScale]);

  const showToastMessage = (message: string) => {
    if (showToast) {
      setToastMessage(message);
      setToastVisible(true);
    }
  };

  const animateSuccess = () => {
    setIsAnimating(true);

    // Icon rotation animation
    Animated.timing(iconRotation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      iconRotation.setValue(0);
      setIsAnimating(false);
    });

    // Button flash animation
    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddToCart = () => {
    if (isAnimating) return;

    animateSuccess();

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

  const iconRotationInterpolate = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      overflow: 'hidden',
    },
    buttonInCart: {
      backgroundColor: colors.primary + 'E6', // Slightly different for in-cart state
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
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 6,
    },
    quantityText: {
      ...getFontStyle('bold', sizeStyles.fontSize - 2),
      color: '#FFFFFF',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: -100,
      bottom: 0,
      width: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      transform: [{skewX: '-20deg'}],
    },
  });

  if (disabled) {
    return (
      <Animated.View
        style={[
          styles.button,
          {backgroundColor: colors.card, opacity: buttonOpacity},
          style,
        ]}>
        <Icon name="cart-off" size={sizeStyles.iconSize} color={colors.text} />
        <Text style={[styles.buttonText, {color: colors.text}]}>
          Unavailable
        </Text>
      </Animated.View>
    );
  }

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{scale: Animated.multiply(scaleValue, pulseValue)}],
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.button,
            isProductInCart && styles.buttonInCart,
            {opacity: buttonOpacity},
            style,
          ]}
          onPress={handleAddToCart}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={0.8}
          testID="add-to-cart-button">
          <View style={styles.iconContainer}>
            <Animated.View
              style={{
                transform: [{rotate: iconRotationInterpolate}],
              }}>
              <Icon
                name={isProductInCart ? 'cart-check' : 'cart-plus'}
                size={sizeStyles.iconSize}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>

          {isProductInCart && cartItem ? (
            <View style={styles.quantityContainer}>
              <Text style={styles.buttonText}>In Cart</Text>
              <Animated.View
                style={[
                  styles.quantityBadge,
                  {transform: [{scale: badgeScale}]},
                ]}>
                <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              </Animated.View>
            </View>
          ) : (
            <Text style={styles.buttonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <CartToast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onHide={() => setToastVisible(false)}
      />
    </>
  );
};

export default AnimatedAddToCartButton;
