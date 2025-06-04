import React, {useContext, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore, CartItem} from '../../store/cartStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: screenWidth} = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface CartItemComponentProps {
  item: CartItem;
  index: number;
  onPress?: () => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({
  item,
  index,
  onPress,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const {updateQuantity, removeFromCart} = useCartStore();

  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemoveItem();
      } else {
        updateQuantity(item.product._id, newQuantity);
      }
    },
    [item.product._id, updateQuantity],
  );

  const handleRemoveItem = useCallback(() => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.product.title}" from your cart?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            // Animate out before removing
            Animated.timing(translateX, {
              toValue: -screenWidth,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              removeFromCart(item.product._id);
            });
          },
        },
      ],
    );
  }, [item.product._id, item.product.title, removeFromCart, translateX]);

  const onGestureEvent = useCallback(
    Animated.event([{nativeEvent: {translationX: translateX}}], {
      useNativeDriver: true,
    }),
    [translateX],
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const {translationX} = event.nativeEvent;

        if (translationX < -SWIPE_THRESHOLD) {
          // Swipe threshold reached - show delete confirmation
          handleRemoveItem();
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [handleRemoveItem, translateX],
  );

  const handleIncrement = useCallback(() => {
    handleQuantityChange(item.quantity + 1);
  }, [item.quantity, handleQuantityChange]);

  const handleDecrement = useCallback(() => {
    handleQuantityChange(item.quantity - 1);
  }, [item.quantity, handleQuantityChange]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 1,
      backgroundColor: colors.background,
    },
    itemContainer: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deleteBackground: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
    },
    deleteIcon: {
      marginRight: 20,
    },
    imageContainer: {
      width: 80,
      height: 80,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F7',
      borderRadius: 8,
      overflow: 'hidden',
      marginRight: 12,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginBottom: 4,
    },
    price: {
      ...getFontStyle('bold', 16),
      color: colors.primary,
      marginBottom: 8,
    },
    subtotal: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
    },
    quantityContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: 60,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.background : '#F5F5F7',
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      backgroundColor: colors.border,
    },
    quantityText: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      padding: 4,
    },
    swipeHint: {
      ...getFontStyle('regular', 12),
      color: isDarkMode ? '#666666' : '#999999',
      textAlign: 'center',
      marginTop: 4,
    },
  });

  if (isDeleting) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Delete Background */}
      <View style={styles.deleteBackground}>
        <Icon
          name="delete"
          size={24}
          color="#FFFFFF"
          style={styles.deleteIcon}
        />
      </View>

      {/* Swipeable Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.itemContainer,
            {
              transform: [{translateX}],
            },
          ]}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={onPress}
            activeOpacity={0.8}>
            {item.product.images && item.product.images.length > 0 ? (
              <Image
                source={{uri: getImageUrl(item.product.images[0]?.url)}}
                style={styles.image}
              />
            ) : (
              <View style={[styles.image, {backgroundColor: colors.card}]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contentContainer}
            onPress={onPress}
            activeOpacity={0.8}>
            <Text style={styles.title} numberOfLines={2}>
              {item.product.title}
            </Text>
            <Text style={styles.price}>${item.product.price.toFixed(2)}</Text>
            <Text style={styles.subtotal}>
              Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>

          <View style={styles.quantityContainer}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecrement}
                disabled={item.quantity <= 1}>
                <Icon
                  name="minus"
                  size={16}
                  color={item.quantity <= 1 ? colors.text : '#FFFFFF'}
                />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}>
                <Icon name="plus" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveItem}>
              <Icon name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default React.memo(CartItemComponent);
