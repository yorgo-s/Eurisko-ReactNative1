import React, {useContext, useRef, useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Animated, View} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  floatingAnimation,
  scaleAnimation,
  buttonPressAnimation,
} from '../../utils/animationUtils';

interface AnimatedFABProps {
  onPress: () => void;
  iconName?: string;
  size?: number;
  bottom?: number;
  right?: number;
  backgroundColor?: string;
  iconColor?: string;
  testID?: string;
}

const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  onPress,
  iconName = 'plus',
  size = 60,
  bottom,
  right = 20,
  backgroundColor,
  iconColor = '#FFFFFF',
  testID,
}) => {
  const {colors} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  // Animation values
  const floatValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const shadowValue = useRef(new Animated.Value(8)).current;

  // Button press animations
  const {pressIn, pressOut} = buttonPressAnimation(scaleValue, 0.9, 150);

  // Start floating animation on mount
  useEffect(() => {
    floatingAnimation(floatValue, -3, 3, 3000).start();
  }, [floatValue]);

  // Icon rotation animation on press
  const handlePress = () => {
    // Rotate icon
    Animated.timing(rotationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      rotationValue.setValue(0);
    });

    // Shadow pulse
    Animated.sequence([
      Animated.timing(shadowValue, {
        toValue: 12,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowValue, {
        toValue: 8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    onPress();
  };

  const handlePressIn = () => {
    pressIn();
    // Reduce floating during press
    floatValue.stopAnimation();
  };

  const handlePressOut = () => {
    pressOut();
    // Resume floating
    floatingAnimation(floatValue, -3, 3, 3000).start();
  };

  const rotationInterpolate = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: bottom || 20 + insets.bottom,
      right: right,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: backgroundColor || colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          transform: [{translateY: floatValue}, {scale: scaleValue}],
          shadowRadius: shadowValue,
        },
      ]}>
      <TouchableOpacity
        style={[styles.fab, {position: 'relative', bottom: 0, right: 0}]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        testID={testID}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={{
              transform: [{rotate: rotationInterpolate}],
            }}>
            <Icon name={iconName} size={size * 0.5} color={iconColor} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedFAB;
