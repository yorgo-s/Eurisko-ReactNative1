import {Animated, Easing} from 'react-native';

// Common animation configurations
export const ANIMATION_CONFIG = {
  spring: {
    tension: 120,
    friction: 8,
    useNativeDriver: true,
  },
  timing: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  bounce: {
    duration: 600,
    easing: Easing.bounce,
    useNativeDriver: true,
  },
  elastic: {
    tension: 100,
    friction: 6,
    useNativeDriver: true,
  },
};

// Fade in animation
export const fadeIn = (
  animatedValue: Animated.Value,
  duration = 300,
  delay = 0,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Fade out animation
export const fadeOut = (
  animatedValue: Animated.Value,
  duration = 200,
  delay = 0,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

// Scale animation
export const scaleAnimation = (
  animatedValue: Animated.Value,
  toValue = 1,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: 120,
    friction: 8,
    useNativeDriver: true,
  });
};

// Slide from bottom animation
export const slideFromBottom = (
  animatedValue: Animated.Value,
  duration = 400,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Slide to bottom animation
export const slideToBottom = (
  animatedValue: Animated.Value,
  toValue = 100,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

// Pulse animation
export const pulseAnimation = (
  animatedValue: Animated.Value,
  minValue = 0.95,
  maxValue = 1.05,
  duration = 800,
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
};

// Shake animation
export const shakeAnimation = (
  animatedValue: Animated.Value,
  intensity = 10,
  duration = 500,
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity / 2,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity / 2,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 4,
      useNativeDriver: true,
    }),
  ]);
};

// Stagger animation for lists
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay = 100,
): Animated.CompositeAnimation => {
  const staggeredAnimations = animations.map((animation, index) =>
    Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: 0,
      delay: index * staggerDelay,
      useNativeDriver: true,
    }),
  );

  return Animated.stagger(staggerDelay, staggeredAnimations);
};

// Loading dots animation
export const loadingDotsAnimation = (
  dot1: Animated.Value,
  dot2: Animated.Value,
  dot3: Animated.Value,
  duration = 600,
): Animated.CompositeAnimation => {
  const animateDot = (animatedValue: Animated.Value, delay: number) =>
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 3,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: duration / 3,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);

  return Animated.loop(
    Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, duration / 6),
      animateDot(dot3, duration / 3),
    ]),
  );
};

// Button press animation
export const buttonPressAnimation = (
  animatedValue: Animated.Value,
  pressValue = 0.95,
  duration = 100,
) => {
  const pressIn = () => {
    Animated.timing(animatedValue, {
      toValue: pressValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 200,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return {pressIn, pressOut};
};

// Card flip animation
export const cardFlipAnimation = (
  animatedValue: Animated.Value,
  duration = 600,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.inOut(Easing.cubic),
    useNativeDriver: true,
  });
};

// Floating animation
export const floatingAnimation = (
  animatedValue: Animated.Value,
  minValue = -5,
  maxValue = 5,
  duration = 2000,
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
};
