import React, {useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, useWindowDimensions} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

// Basic animated skeleton box
const SkeletonBox: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const {isDarkMode} = useContext(ThemeContext);
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
    outputRange: isDarkMode ? ['#2A2A2A', '#3A3A3A'] : ['#E1E9EE', '#F2F8FC'],
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

// Product Card Skeleton
export const ProductCardSkeleton: React.FC<{width: number}> = ({width}) => {
  return (
    <View style={[styles.cardContainer, {width}]}>
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

// Product List Skeleton
export const ProductListSkeleton: React.FC<{
  numColumns?: number;
  itemCount?: number;
}> = ({numColumns = 2, itemCount = 6}) => {
  const {width: windowWidth} = useWindowDimensions();

  // Calculate item width based on number of columns
  const itemWidth = (windowWidth - 16 * (numColumns + 1)) / numColumns;

  return (
    <View style={styles.listContainer}>
      {Array.from({length: itemCount}).map((_, index) => (
        <ProductCardSkeleton key={`skeleton-${index}`} width={itemWidth} />
      ))}
    </View>
  );
};

// Product Details Skeleton
export const ProductDetailsSkeleton: React.FC = () => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

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

// Search Results Skeleton
export const SearchResultsSkeleton: React.FC<{itemCount?: number}> = ({
  itemCount = 3,
}) => {
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

const styles = StyleSheet.create({
  // Product Card Skeleton Styles
  cardContainer: {
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  cardSpacing: {
    height: 8,
  },

  // Product List Skeleton Styles
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },

  // Product Details Skeleton Styles
  detailsContainer: {
    flex: 1,
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

  // Search Results Skeleton Styles
  searchContainer: {
    padding: 16,
  },
  searchItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  searchItemContent: {
    marginLeft: 12,
    flex: 1,
  },
});

export default {
  ProductCardSkeleton,
  ProductListSkeleton,
  ProductDetailsSkeleton,
  SearchResultsSkeleton,
};
