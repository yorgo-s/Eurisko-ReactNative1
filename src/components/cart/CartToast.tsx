import React, {useContext, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: screenWidth} = Dimensions.get('window');

interface CartToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
}

const CartToast: React.FC<CartToastProps> = ({
  visible,
  message,
  type = 'success',
  onHide,
  duration = 3000,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'check-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return colors.error;
      case 'info':
        return colors.primary;
      default:
        return '#4CAF50';
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
    },
    toast: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: getIconColor(),
    },
    icon: {
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    message: {
      ...getFontStyle('medium', 14),
      color: colors.text,
      lineHeight: 20,
    },
    closeButton: {
      padding: 4,
      marginLeft: 8,
    },
  });

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Icon
          name={getIconName()}
          size={24}
          color={getIconColor()}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Icon name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default CartToast;
