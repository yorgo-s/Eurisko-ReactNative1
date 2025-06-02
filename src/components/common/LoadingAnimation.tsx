import React, {useContext, useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {loadingDotsAnimation} from '../../utils/animationUtils';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  type?: 'dots' | 'pulse' | 'wave';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  color,
  type = 'dots',
}) => {
  const {colors} = useContext(ThemeContext);

  // Animation values for dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Animation values for pulse
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Animation values for wave
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const wave5 = useRef(new Animated.Value(0)).current;

  const animationColor = color || colors.primary;

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {dotSize: 6, spacing: 4, waveHeight: 15, waveWidth: 3};
      case 'large':
        return {dotSize: 12, spacing: 8, waveHeight: 30, waveWidth: 6};
      default:
        return {dotSize: 8, spacing: 6, waveHeight: 20, waveWidth: 4};
    }
  };

  const sizeConfig = getSizeConfig();

  useEffect(() => {
    if (type === 'dots') {
      loadingDotsAnimation(dot1, dot2, dot3, 900).start();
    } else if (type === 'pulse') {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnim.start();
      return () => pulseAnim.stop();
    } else if (type === 'wave') {
      const createWaveAnimation = (animValue: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: -sizeConfig.waveHeight,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );

      Animated.parallel([
        createWaveAnimation(wave1, 0),
        createWaveAnimation(wave2, 100),
        createWaveAnimation(wave3, 200),
        createWaveAnimation(wave4, 300),
        createWaveAnimation(wave5, 400),
      ]).start();
    }
  }, [type, size]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: sizeConfig.dotSize,
      height: sizeConfig.dotSize,
      borderRadius: sizeConfig.dotSize / 2,
      backgroundColor: animationColor,
      marginHorizontal: sizeConfig.spacing / 2,
    },
    pulseContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulseCircle: {
      width: sizeConfig.dotSize * 3,
      height: sizeConfig.dotSize * 3,
      borderRadius: (sizeConfig.dotSize * 3) / 2,
      backgroundColor: animationColor,
    },
    waveContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: sizeConfig.waveHeight * 2,
    },
    waveBar: {
      width: sizeConfig.waveWidth,
      height: sizeConfig.waveHeight,
      backgroundColor: animationColor,
      marginHorizontal: 1,
      borderRadius: sizeConfig.waveWidth / 2,
    },
  });

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, {opacity: dot1}]} />
      <Animated.View style={[styles.dot, {opacity: dot2}]} />
      <Animated.View style={[styles.dot, {opacity: dot3}]} />
    </View>
  );

  const renderPulse = () => (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            transform: [{scale: pulseValue}],
            opacity: pulseValue.interpolate({
              inputRange: [1, 1.2],
              outputRange: [0.7, 0.3],
            }),
          },
        ]}
      />
    </View>
  );

  const renderWave = () => (
    <View style={styles.waveContainer}>
      <Animated.View
        style={[styles.waveBar, {transform: [{translateY: wave1}]}]}
      />
      <Animated.View
        style={[styles.waveBar, {transform: [{translateY: wave2}]}]}
      />
      <Animated.View
        style={[styles.waveBar, {transform: [{translateY: wave3}]}]}
      />
      <Animated.View
        style={[styles.waveBar, {transform: [{translateY: wave4}]}]}
      />
      <Animated.View
        style={[styles.waveBar, {transform: [{translateY: wave5}]}]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {type === 'dots' && renderDots()}
      {type === 'pulse' && renderPulse()}
      {type === 'wave' && renderWave()}
    </View>
  );
};

export default LoadingAnimation;
