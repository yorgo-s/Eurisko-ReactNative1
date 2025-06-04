import React, {useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, useWindowDimensions} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

// Basic animated skeleton box with theme support
const SkeletonBox: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const {isDarkMode, colors} = useContext(ThemeContext);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isDarkMode ? [colors.card, '#3A3A3A'] : ['#E1E9EE', '#F2F8FC'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Product Card Skeleton with theme support
export const ProductCardSkeleton: React.FC<{width: number}> = ({width}) => {
  const {colors} = useContext(ThemeContext);

  const styles = StyleSheet.create({
    cardContainer: {
      width,
      margin: 8,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    cardContent: {
      padding: 12,
    },
    cardSpacing: {
      height: 8,
    },
  });

  return (
    <View style={styles.cardContainer}>
      <SkeletonBox width={width - 16} height={120} borderRadius={8} />
      <View style={styles.cardContent}>
        <SkeletonBox width={width - 32} height={20} borderRadius={4} />
        <View style={styles.cardSpacing} />
        <SkeletonBox width={(width - 32) * 0.6} height={16} borderRadius={4} />
        <View style={styles.cardSpacing} />
        <SkeletonBox width={(width - 32) * 0.4} height={18} borderRadius={4} />
      </View>
    </View>
  );
};

// Product List Skeleton with theme support
export const ProductListSkeleton: React.FC<{
  numColumns?: number;
  itemCount?: number;
}> = ({numColumns = 2, itemCount = 6}) => {
  const {width: windowWidth} = useWindowDimensions();
  const {colors} = useContext(ThemeContext);

  // Calculate item width based on number of columns
  const itemWidth = (windowWidth - 16 * (numColumns + 1)) / numColumns;

  const styles = StyleSheet.create({
    listContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      padding: 8,
      backgroundColor: colors.background,
    },
  });

  return (
    <View style={styles.listContainer}>
      {Array.from({length: itemCount}).map((_, index) => (
        <ProductCardSkeleton key={`skeleton-${index}`} width={itemWidth} />
      ))}
    </View>
  );
};

// Product Details Skeleton with theme support
export const ProductDetailsSkeleton: React.FC = () => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {colors} = useContext(ThemeContext);

  const styles = StyleSheet.create({
    detailsContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    detailsContent: {
      padding: 16,
    },
    detailsSpacing: {
      height: 16,
    },
    smallSpacing: {
      height: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
  });

  return (
    <View style={styles.detailsContainer}>
      {/* Image Gallery Skeleton */}
      <SkeletonBox
        width={windowWidth}
        height={windowHeight * 0.4}
        borderRadius={0}
      />

      <View style={styles.detailsContent}>
        {/* Title and Price */}
        <SkeletonBox width={windowWidth - 32} height={24} borderRadius={4} />
        <View style={styles.detailsSpacing} />
        <SkeletonBox
          width={(windowWidth - 32) * 0.3}
          height={28}
          borderRadius={4}
        />

        <View style={styles.detailsSpacing} />

        {/* Description */}
        <SkeletonBox width={windowWidth - 32} height={16} borderRadius={4} />
        <View style={styles.smallSpacing} />
        <SkeletonBox width={windowWidth - 32} height={16} borderRadius={4} />
        <View style={styles.smallSpacing} />
        <SkeletonBox
          width={(windowWidth - 32) * 0.7}
          height={16}
          borderRadius={4}
        />

        <View style={styles.detailsSpacing} />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <SkeletonBox
            width={(windowWidth - 48) / 2}
            height={44}
            borderRadius={8}
          />
          <SkeletonBox
            width={(windowWidth - 48) / 2}
            height={44}
            borderRadius={8}
          />
        </View>
      </View>
    </View>
  );
};

// Search Results Skeleton with theme support
export const SearchResultsSkeleton: React.FC<{itemCount?: number}> = ({
  itemCount = 3,
}) => {
  const {colors} = useContext(ThemeContext);

  const styles = StyleSheet.create({
    searchContainer: {
      padding: 16,
      backgroundColor: colors.background,
    },
    searchItem: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
      backgroundColor: colors.background,
    },
    searchItemContent: {
      marginLeft: 12,
      flex: 1,
    },
    smallSpacing: {
      height: 8,
    },
  });

  return (
    <View style={styles.searchContainer}>
      {Array.from({length: itemCount}).map((_, index) => (
        <View key={`search-skeleton-${index}`} style={styles.searchItem}>
          <SkeletonBox width={80} height={80} borderRadius={8} />
          <View style={styles.searchItemContent}>
            <SkeletonBox width={200} height={18} borderRadius={4} />
            <View style={styles.smallSpacing} />
            <SkeletonBox width={120} height={14} borderRadius={4} />
            <View style={styles.smallSpacing} />
            <SkeletonBox width={80} height={16} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default {
  ProductCardSkeleton,
  ProductListSkeleton,
  ProductDetailsSkeleton,
  SearchResultsSkeleton,
};
