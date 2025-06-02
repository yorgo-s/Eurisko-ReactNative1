import React, {useContext, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../api/products';
import AddToCartButton from '../cart/AddToCartButton';
import {fadeIn, buttonPressAnimation} from '../../utils/animationUtils';

type AnimatedProductCardProps = {
  product: Product;
  onPress: () => void;
  numColumns: number;
  index: number;
};

const AnimatedProductCard = ({
  product,
  onPress,
  numColumns,
  index,
}: AnimatedProductCardProps) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const {width: windowWidth} = useWindowDimensions();

  // Animation values
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const slideValue = useRef(new Animated.Value(50)).current;

  // Calculate item width based on current window width and number of columns
  const itemWidth = (windowWidth - 16 * (numColumns + 1)) / numColumns;

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      fadeIn(fadeValue, 400, index * 100),
      Animated.timing(slideValue, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeValue, slideValue, index]);

  // Button press animations
  const {pressIn, pressOut} = buttonPressAnimation(scaleValue);

  const styles = StyleSheet.create({
    container: {
      width: itemWidth,
      margin: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: numColumns > 2 ? 120 : 140,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F7',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    contentContainer: {
      padding: 12,
    },
    title: {
      ...getFontStyle('bold', 16),
      marginBottom: 4,
      lineHeight: 20,
      height: 40,
      color: colors.text,
    },
    price: {
      ...getFontStyle('bold', 16),
      color: colors.primary,
      marginBottom: 8,
    },
    buttonContainer: {
      marginTop: 4,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    originalPrice: {
      ...getFontStyle('regular', 12),
      color: isDarkMode ? '#AAAAAA' : '#999999',
      textDecorationLine: 'line-through',
    },
    discount: {
      backgroundColor: colors.error,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    discountText: {
      ...getFontStyle('bold', 10),
      color: '#FFFFFF',
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeValue,
          transform: [{scale: scaleValue}, {translateY: slideValue}],
        },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.9}
        testID={`product-card-${product._id}`}>
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                source={{uri: getImageUrl(product.images[0]?.url)}}
                style={styles.image}
                testID={`product-image-${product._id}`}
              />
              <Animated.View style={styles.imageOverlay} />
            </>
          ) : (
            <View style={[styles.image, {backgroundColor: colors.card}]} />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
            testID={`product-title-${product._id}`}>
            {product.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price} testID={`product-price-${product._id}`}>
              ${product.price.toFixed(2)}
            </Text>

            {/* Optional: Show discount badge for demonstration */}
            {Math.random() > 0.7 && (
              <View style={styles.discount}>
                <Text style={styles.discountText}>
                  -{Math.floor(Math.random() * 30 + 10)}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Animated Add to Cart Button */}
      <View style={styles.buttonContainer}>
        <AddToCartButton
          product={product}
          size="small"
          style={{margin: 12, marginTop: 0}}
        />
      </View>
    </Animated.View>
  );
};

export default AnimatedProductCard;
