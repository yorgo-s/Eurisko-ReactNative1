import React, {useRef, useEffect} from 'react';
import {Animated, ViewStyle} from 'react-native';
import {fadeIn, slideFromBottom} from '../../utils/animationUtils';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'slideUp' | 'scale' | 'none';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  animationType = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(50)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const animations = [];

    switch (animationType) {
      case 'fade':
        animations.push(fadeIn(fadeValue, duration, delay));
        break;

      case 'slideUp':
        animations.push(
          fadeIn(fadeValue, duration, delay),
          slideFromBottom(slideValue, duration + 100),
        );
        break;

      case 'scale':
        animations.push(
          fadeIn(fadeValue, duration, delay),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            delay,
            useNativeDriver: true,
          }),
        );
        break;

      case 'none':
        fadeValue.setValue(1);
        slideValue.setValue(0);
        scaleValue.setValue(1);
        return;

      default:
        animations.push(fadeIn(fadeValue, duration, delay));
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [animationType, duration, delay, fadeValue, slideValue, scaleValue]);

  const getAnimatedStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      opacity: fadeValue,
    };

    switch (animationType) {
      case 'slideUp':
        return {
          ...baseStyle,
          transform: [{translateY: slideValue}],
        };

      case 'scale':
        return {
          ...baseStyle,
          transform: [{scale: scaleValue}],
        };

      default:
        return baseStyle;
    }
  };

  if (animationType === 'none') {
    return <>{children}</>;
  }

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedScreenWrapper;
