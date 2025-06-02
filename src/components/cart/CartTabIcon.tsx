import React, {useContext, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore} from '../../store/cartStore';
import {scaleAnimation} from '../../utils/animationUtils';

interface CartTabIconProps {
  color: string;
  size: number;
}

const CartTabIcon: React.FC<CartTabIconProps> = ({color, size}) => {
  const {colors, getFontStyle} = useContext(ThemeContext);
  const {totalItems} = useCartStore();

  // Animation values
  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeOpacity = useRef(
    new Animated.Value(totalItems > 0 ? 1 : 0),
  ).current;
  const iconShake = useRef(new Animated.Value(0)).current;

  // Previous count to detect changes
  const prevCount = useRef(totalItems);

  // Animate when totalItems changes
  useEffect(() => {
    if (totalItems !== prevCount.current) {
      if (totalItems > prevCount.current) {
        // Items added - bounce animation
        Animated.sequence([
          scaleAnimation(badgeScale, 1.4, 200),
          scaleAnimation(badgeScale, 1, 200),
        ]).start();

        // Icon shake animation
        Animated.sequence([
          Animated.timing(iconShake, {
            toValue: 3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: -3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: 3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Fade in/out badge based on count
      Animated.timing(badgeOpacity, {
        toValue: totalItems > 0 ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      prevCount.current = totalItems;
    }
  }, [totalItems, badgeScale, badgeOpacity, iconShake]);

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: {
      ...getFontStyle('bold', 11),
      color: '#FFFFFF',
      lineHeight: 12,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{translateX: iconShake}],
          },
        ]}>
        <Icon name="cart" color={color} size={size} />
      </Animated.View>

      <Animated.View
        style={[
          styles.badge,
          {
            opacity: badgeOpacity,
            transform: [{scale: badgeScale}],
          },
        ]}>
        <Text style={styles.badgeText}>
          {totalItems > 99 ? '99+' : totalItems.toString()}
        </Text>
      </Animated.View>
    </View>
  );
};

export default CartTabIcon;
