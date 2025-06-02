import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import ProductCard from '../../components/products/ProductCard';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Product, productsApi} from '../../api/products';
import {useDebounce} from '../../hooks/useDebounce';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ProductListSkeleton,
  SearchResultsSkeleton,
} from '../../components/common/CustomSkeletonLoader';

import AnimatedProductCard from '../components/products/AnimatedProductCard';
import AnimatedFAB from '../components/common/AnimatedFAB';
import LoadingAnimation from '../components/common/LoadingAnimation';
import {
  fadeIn,
  staggerAnimation,
  slideFromBottom,
} from '../../utils/animationUtils';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, toggleTheme, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [refreshing, setRefreshing] = useState(false);

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;
  const numColumns = isLandscape ? 4 : 2;

  // State to manage sorting options
  const [sortBy, setSortBy] = useState<'price' | 'createdAt' | undefined>(
    'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Check if we're searching
  const isSearching = debouncedSearch.trim().length > 0;

  // Query for search - fetches ALL products when searching
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['searchProducts', debouncedSearch, sortBy, sortOrder],
    queryFn: async () => {
      const allProductsData = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await productsApi.getProducts({
          page,
          limit: 50,
          sortBy,
          order: sortOrder,
        });

        if (response.data && response.data.length > 0) {
          allProductsData.push(...response.data);
          hasMore = response.pagination?.hasNextPage || false;
          page++;
        } else {
          hasMore = false;
        }
      }

      const searchTerm = debouncedSearch.toLowerCase().trim();
      const filtered = allProductsData.filter(product => {
        if (product.title.toLowerCase().includes(searchTerm)) return true;
        if (product.description.toLowerCase().includes(searchTerm)) return true;

        const priceStr = product.price.toString();
        if (priceStr.includes(searchTerm)) return true;

        const searchNumber = parseFloat(searchTerm);
        if (!isNaN(searchNumber)) {
          const priceDiff = Math.abs(product.price - searchNumber);
          if (priceDiff <= searchNumber * 0.1) return true;
        }

        return false;
      });

      return filtered;
    },
    enabled: isSearching,
    staleTime: 30000,
  });

  // Infinite query for normal browsing (when not searching)
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useInfiniteQuery({
    queryKey: ['products', {sortBy, order: sortOrder}],
    queryFn: async ({pageParam}) => {
      const response = await productsApi.getProducts({
        page: pageParam,
        limit: isLandscape ? 8 : 6,
        sortBy: sortBy,
        order: sortOrder,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: !isSearching,
  });

  // Flatten the pages of products for display
  const allProducts = useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(page => page.data || []);
  }, [productsData]);

  // Determine which products to display
  const displayedProducts = isSearching ? searchData || [] : allProducts;

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', product);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  // FIXED: Improved refresh handling
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSearching) {
        // When searching, refetch search results
        await refetchSearch();
      } else {
        // When not searching, invalidate and refetch products
        await queryClient.invalidateQueries({queryKey: ['products']});
        await refetchProducts();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isSearching, refetchSearch, refetchProducts, queryClient]);

  // Handle loading more products on scroll (only when not searching)
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isSearching) {
      fetchNextPage();
    }
  };

  // Handle sorting
  const handleSort = (type: 'price' | 'createdAt', order: 'asc' | 'desc') => {
    setSortBy(type);
    setSortOrder(order);
    setShowSortMenu(false);
  };

  // Footer component to show loading indicator when fetching more products
  const renderFooter = () => {
    if (!isFetchingNextPage || isSearching) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    );
  };

  // Main screen content with header and search bar
  const renderMainContent = () => {
    const headerContent = (
      <>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          All Products
        </Animated.Text>

        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              opacity: searchBarAnim,
              transform: [
                {
                  translateY: searchBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <Icon
            name="magnify"
            size={20}
            color={colors.text}
            style={{marginRight: 8}}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
            value={searchInput}
            onChangeText={setSearchInput}
            testID="search-input"
          />
          {searchInput ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.searchButton}>
              <Icon name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      </>
    );

    if (isLandscape) {
      return (
        <View style={styles.headerLandscape}>
          {headerContent}
          <Animated.View
            style={{
              flexDirection: 'row',
              opacity: sortButtonAnim,
              transform: [{scale: sortButtonAnim}],
            }}>
            <TouchableOpacity
              onPress={() => setShowSortMenu(!showSortMenu)}
              style={{marginLeft: 12}}>
              <Icon name="sort" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={{marginLeft: 12}}>
              <Icon
                name={
                  isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'
                }
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    } else {
      return (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>All Products</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowSortMenu(!showSortMenu)}
                style={styles.headerButton}>
                <Icon name="sort" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.headerButton}>
                <Icon
                  name={
                    isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'
                  }
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBarContainer}>
            <Icon
              name="magnify"
              size={20}
              color={colors.text}
              style={{marginRight: 8}}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
              value={searchInput}
              onChangeText={setSearchInput}
              testID="search-input"
            />
            {searchInput ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.searchButton}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      );
    }
  };

  // NEW: Render loading content based on search state
  const renderLoadingContent = () => {
    if (isSearching && isSearchLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <SearchResultsSkeleton itemCount={5} />
        </View>
      );
    }

    if (!isSearching && isLoadingProducts && displayedProducts.length === 0) {
      return (
        <View style={styles.skeletonContainer}>
          <ProductListSkeleton
            numColumns={numColumns}
            itemCount={numColumns === 2 ? 6 : 8}
          />
        </View>
      );
    }

    return null;
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const sortButtonAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      fadeIn(fadeAnim, 500),
      slideFromBottom(slideAnim, 600),
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(sortButtonAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: Math.max(16, insets.top - 30),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLandscape: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: Math.max(12, insets.top),
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      marginLeft: 12,
    },
    title: {
      ...typography.heading2,
      fontSize: isLandscape ? 22 : 24,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.card : '#F0F0F0',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginTop: 8,
    },
    searchInput: {
      flex: 1,
      padding: isLandscape ? 8 : 10,
      ...getFontStyle('regular', isLandscape ? 14 : 16),
      color: colors.text,
    },
    searchButton: {
      padding: 6,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      ...typography.body,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    list: {
      padding: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      ...typography.body,
      textAlign: 'center',
      color: colors.text,
    },
    addButton: {
      position: 'absolute',
      bottom: 20 + insets.bottom,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    footerLoader: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    footerText: {
      ...getFontStyle('regular', 14),
      marginLeft: 8,
      color: colors.text,
    },
    searchResultText: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginTop: 8,
      marginHorizontal: 16,
    },
    sortMenu: {
      position: 'absolute',
      top: isLandscape ? 60 : 100,
      right: isLandscape ? 60 : 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1000,
      minWidth: 200,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 4,
    },
    sortOptionActive: {
      backgroundColor: colors.primary + '20',
    },
    sortOptionText: {
      ...getFontStyle('regular', 16),
      color: colors.text,
      flex: 1,
    },
    sortOptionIcon: {
      marginLeft: 8,
    },
    sortSeparator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    sortHeader: {
      ...getFontStyle('semiBold', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    // NEW: Skeleton container styles
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  // Determine loading state
  const isLoading = isSearching ? isSearchLoading : isLoadingProducts;
  const error = isSearching ? searchError : productsError;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {renderMainContent()}

      {showSortMenu && (
        <View style={styles.sortMenu}>
          <Text style={styles.sortHeader}>SORT BY PRICE</Text>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === 'price' &&
                sortOrder === 'asc' &&
                styles.sortOptionActive,
            ]}
            onPress={() => handleSort('price', 'asc')}>
            <Text style={styles.sortOptionText}>Price: Low to High</Text>
            <Icon
              name="arrow-up"
              size={16}
              color={
                sortBy === 'price' && sortOrder === 'asc'
                  ? colors.primary
                  : colors.text
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === 'price' &&
                sortOrder === 'desc' &&
                styles.sortOptionActive,
            ]}
            onPress={() => handleSort('price', 'desc')}>
            <Text style={styles.sortOptionText}>Price: High to Low</Text>
            <Icon
              name="arrow-down"
              size={16}
              color={
                sortBy === 'price' && sortOrder === 'desc'
                  ? colors.primary
                  : colors.text
              }
            />
          </TouchableOpacity>

          <View style={styles.sortSeparator} />

          <Text style={styles.sortHeader}>SORT BY DATE</Text>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === 'createdAt' &&
                sortOrder === 'desc' &&
                styles.sortOptionActive,
            ]}
            onPress={() => handleSort('createdAt', 'desc')}>
            <Text style={styles.sortOptionText}>Date: Newest First</Text>
            <Icon
              name="arrow-down"
              size={16}
              color={
                sortBy === 'createdAt' && sortOrder === 'desc'
                  ? colors.primary
                  : colors.text
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === 'createdAt' &&
                sortOrder === 'asc' &&
                styles.sortOptionActive,
            ]}
            onPress={() => handleSort('createdAt', 'asc')}>
            <Text style={styles.sortOptionText}>Date: Oldest First</Text>
            <Icon
              name="arrow-up"
              size={16}
              color={
                sortBy === 'createdAt' && sortOrder === 'asc'
                  ? colors.primary
                  : colors.text
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {isSearching && !isSearchLoading && (
        <Text
          style={[
            styles.searchResultText,
            isLandscape && {marginTop: 4, marginBottom: 4},
          ]}>
          {displayedProducts.length > 0
            ? `Found ${displayedProducts.length} results for "${debouncedSearch}"`
            : `No products found matching "${debouncedSearch}"`}
        </Text>
      )}

      {/* NEW: Show skeleton loading instead of spinner */}
      {renderLoadingContent()}

      {/* Show content when not loading or when we have data */}
      {!isLoading || displayedProducts.length > 0 ? (
        error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading products</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => handleRefresh()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : displayedProducts.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Icon
              name={isSearching ? 'magnify-close' : 'package-variant'}
              size={48}
              color={isDarkMode ? '#666666' : '#CCCCCC'}
            />
            <Text style={[styles.emptyText, {marginTop: 16}]}>
              {isSearching
                ? `No products found matching "${debouncedSearch}"`
                : 'No products available'}
            </Text>
            {isSearching && (
              <TouchableOpacity
                style={[styles.retryButton, {marginTop: 16}]}
                onPress={handleClearSearch}>
                <Text style={styles.retryButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={displayedProducts}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                numColumns={numColumns}
              />
            )}
            key={numColumns}
            numColumns={numColumns}
            contentContainerStyle={styles.list}
            testID="products-list"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )
      ) : null}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddProduct}
        testID="add-product-button">
        <Icon name="plus" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProductsScreen;
