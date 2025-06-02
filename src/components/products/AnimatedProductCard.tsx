import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {ThemeContext} from '../../context/ThemeContext';
import {Product} from '../../api/products';

type AnimatedProductCardProps = {
  product: Product;
  onPress: () => void;
  numColumns: number;
  index?: number; // For staggered animations
};

const AnimatedProductCard = ({
  product,
  onPress,
  numColumns,
  index = 0,
}: AnimatedProductCardProps) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const {width: windowWidth} = useWindowDimensions();

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const pressScale = useSharedValue(1);

  // Calculate item width based on current window width and number of columns
  const itemWidth = (windowWidth - 16 * (numColumns + 1)) / numColumns;

  // Mount animation with stagger effect
  useEffect(() => {
    const delay = index * 100; // Stagger by 100ms per item

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
      }),
    );

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 600,
      }),
    );

    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      }),
    );
  }, [index]);

  // Animated styles for the container
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: scale.value * pressScale.value},
        {translateY: translateY.value},
      ],
      opacity: opacity.value,
    };
  });

  // Press animations
  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePress = () => {
    // Add a small scale animation on press
    pressScale.value = withSpring(
      0.98,
      {
        damping: 15,
        stiffness: 400,
      },
      () => {
        pressScale.value = withSpring(1, {
          damping: 15,
          stiffness: 400,
        });
        runOnJS(onPress)();
      },
    );
  };

  // Function to get the full image URL
  const getImageUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    return `https://backend-practice.eurisko.me${relativeUrl}`;
  };

  const styles = StyleSheet.create({
    container: {
      width: itemWidth,
      margin: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: numColumns > 2 ? 120 : 140,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F7',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    contentContainer: {
      padding: 12,
    },
    title: {
      ...getFontStyle('bold', 17),
      marginBottom: 4,
      lineHeight: 20,
      height: 40,
      color: colors.text,
    },
    price: {
      ...getFontStyle('bold', 16),
      color: colors.primary,
    },
  });

  return (
    <Animated.View style={animatedContainerStyle}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1} // Disable default opacity change
        testID={`product-card-${product._id}`}>
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{uri: getImageUrl(product.images[0]?.url)}}
              style={styles.image}
              testID={`product-image-${product._id}`}
            />
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
          <Text style={styles.price} testID={`product-price-${product._id}`}>
            ${product.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedProductCard;
