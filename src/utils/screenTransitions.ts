import {StackNavigationOptions} from '@react-navigation/stack';
import {TransitionPresets} from '@react-navigation/stack';

// Custom slide from right transition
export const slideFromRightTransition: StackNavigationOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Fade transition
export const fadeTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
  cardStyleInterpolator: ({current}) => {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  },
};

// Scale transition
export const scaleTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        tension: 120,
        friction: 8,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    };
  },
};

// Slide from bottom transition (for modals)
export const slideFromBottomTransition: StackNavigationOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        tension: 100,
        friction: 8,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Flip transition
export const flipTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 350,
      },
    },
  },
  cardStyleInterpolator: ({current, layouts}) => {
    const rotateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '0deg'],
    });

    return {
      cardStyle: {
        transform: [{perspective: 1000}, {rotateY}],
        backfaceVisibility: 'hidden',
      },
    };
  },
};

// Zoom transition
export const zoomTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        tension: 100,
        friction: 7,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
  cardStyleInterpolator: ({current}) => {
    return {
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    };
  },
};

// Custom elastic bounce transition
export const elasticTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        tension: 50,
        friction: 7,
        mass: 1,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.8, 1.1, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    };
  },
};

// Cube transition (3D effect)
export const cubeTransition: StackNavigationOptions = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 350,
      },
    },
  },
  cardStyleInterpolator: ({current, next, layouts}) => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
    });

    const rotateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['-90deg', '0deg'],
    });

    const nextTranslateX = next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -layouts.screen.width],
        })
      : 0;

    const nextRotateY = next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '90deg'],
        })
      : '0deg';

    return {
      cardStyle: {
        transform: [{perspective: 1000}, {translateX}, {rotateY}],
      },
    };
  },
};

// Get transition by name
export const getTransitionByName = (
  transitionName: string,
): StackNavigationOptions => {
  switch (transitionName) {
    case 'slideFromRight':
      return slideFromRightTransition;
    case 'fade':
      return fadeTransition;
    case 'scale':
      return scaleTransition;
    case 'slideFromBottom':
      return slideFromBottomTransition;
    case 'flip':
      return flipTransition;
    case 'zoom':
      return zoomTransition;
    case 'elastic':
      return elasticTransition;
    case 'cube':
      return cubeTransition;
    default:
      return slideFromRightTransition;
  }
};
