import {Animated, Dimensions} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export class CartAnimationManager {
  private static instance: CartAnimationManager;
  private animatedItems: Map<string, Animated.Value> = new Map();

  static getInstance(): CartAnimationManager {
    if (!CartAnimationManager.instance) {
      CartAnimationManager.instance = new CartAnimationManager();
    }
    return CartAnimationManager.instance;
  }

  // Animate item flying to cart
  animateItemToCart(
    itemId: string,
    startPosition: {x: number; y: number},
    endPosition: {x: number; y: number},
    onComplete?: () => void,
  ): Animated.CompositeAnimation {
    const translateX = new Animated.Value(startPosition.x);
    const translateY = new Animated.Value(startPosition.y);
    const scale = new Animated.Value(1);
    const opacity = new Animated.Value(1);

    // Store animated values for potential cleanup
    this.animatedItems.set(`${itemId}_x`, translateX);
    this.animatedItems.set(`${itemId}_y`, translateY);
    this.animatedItems.set(`${itemId}_scale`, scale);
    this.animatedItems.set(`${itemId}_opacity`, opacity);

    const flyToCart = Animated.parallel([
      // Move to cart position
      Animated.timing(translateX, {
        toValue: endPosition.x,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: endPosition.y,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale down as it flies
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
      // Fade out near the end
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);

    flyToCart.start(finished => {
      if (finished) {
        this.cleanup(itemId);
        onComplete?.();
      }
    });

    return flyToCart;
  }

  // Animate cart badge bounce
  animateCartBadge(
    badgeScale: Animated.Value,
    intensity = 1.3,
    duration = 400,
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: intensity,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
    ]);
  }

  // Animate cart icon shake
  animateCartShake(
    shakeValue: Animated.Value,
    intensity = 5,
    duration = 300,
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(shakeValue, {
        toValue: intensity,
        duration: duration / 6,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -intensity,
        duration: duration / 6,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: intensity,
        duration: duration / 6,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -intensity,
        duration: duration / 6,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: intensity / 2,
        duration: duration / 6,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 0,
        duration: duration / 6,
        useNativeDriver: true,
      }),
    ]);
  }

  // Animate item removal with slide out
  animateItemRemoval(
    translateX: Animated.Value,
    opacity: Animated.Value,
    direction: 'left' | 'right' = 'left',
    duration = 300,
    onComplete?: () => void,
  ): Animated.CompositeAnimation {
    const toValue = direction === 'left' ? -screenWidth : screenWidth;

    const removeAnimation = Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration * 0.8,
        useNativeDriver: true,
      }),
    ]);

    removeAnimation.start(finished => {
      if (finished) {
        onComplete?.();
      }
    });

    return removeAnimation;
  }

  // Animate list item entrance with stagger
  animateListItemEntrance(
    items: Array<{
      opacity: Animated.Value;
      translateY: Animated.Value;
    }>,
    staggerDelay = 100,
  ): Animated.CompositeAnimation {
    const animations = items.map(({opacity, translateY}, index) =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay: index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          delay: index * staggerDelay,
          useNativeDriver: true,
        }),
      ]),
    );

    return Animated.parallel(animations);
  }

  // Animate cart total update
  animateCartTotal(
    scaleValue: Animated.Value,
    colorValue: Animated.Value,
    duration = 600,
  ): Animated.CompositeAnimation {
    return Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: duration / 3,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: (duration * 2) / 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(colorValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(colorValue, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: false,
        }),
      ]),
    ]);
  }

  // Cleanup animations for specific item
  private cleanup(itemId: string): void {
    const keys = Array.from(this.animatedItems.keys()).filter(key =>
      key.startsWith(itemId),
    );
    keys.forEach(key => {
      this.animatedItems.delete(key);
    });
  }

  // Cleanup all animations
  cleanupAll(): void {
    this.animatedItems.clear();
  }

  // Create a floating particle effect
  createParticleEffect(
    particles: Array<{
      x: Animated.Value;
      y: Animated.Value;
      opacity: Animated.Value;
      scale: Animated.Value;
    }>,
    duration = 1000,
  ): Animated.CompositeAnimation {
    const particleAnimations = particles.map(particle => {
      const randomX = (Math.random() - 0.5) * 200;
      const randomY = (Math.random() - 0.5) * 200;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: randomX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: randomY,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: duration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: (duration * 3) / 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.parallel(particleAnimations);
  }

  // Create ripple effect animation
  createRippleEffect(
    rippleScale: Animated.Value,
    rippleOpacity: Animated.Value,
    maxScale = 4,
    duration = 600,
  ): Animated.CompositeAnimation {
    return Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: maxScale,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]);
  }

  // Animate success checkmark
  animateSuccessCheck(
    checkScale: Animated.Value,
    checkOpacity: Animated.Value,
    duration = 800,
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1.2,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(checkOpacity, {
        toValue: 0,
        duration: duration / 4,
        useNativeDriver: true,
      }),
    ]);
  }
}
