// src/screens/products/ProductsScreen.tsx
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
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import AnimatedProductCard from '../../components/products/AnimatedProductCard';
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
import LoadingAnimation from '../../components/common/LoadingAnimation';

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

  // Animation values - keeping your original ones and adding new ones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const sortButtonAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  // Additional animations for enhanced UX
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const searchBarScale = useRef(new Animated.Value(1)).current;
  const sortMenuScale = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

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

  // Keep your original entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
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

  // Animation for sort menu
  useEffect(() => {
    Animated.spring(sortMenuScale, {
      toValue: showSortMenu ? 1 : 0,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [showSortMenu]);

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
    isInitialLoading,
  } = useInfiniteQuery({
    queryKey: ['products', {sortBy, order: sortOrder}],
    queryFn: async ({pageParam}: {pageParam: number}) => {
      const response = await productsApi.getProducts({
        page: pageParam,
        limit: isLandscape ? 8 : 6,
        sortBy: sortBy,
        order: sortOrder,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
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

  // Optimized handlers with useCallback
  const handleProductPress = useCallback(
    (product: Product) => {
      // Animate list before navigation
      Animated.timing(listOpacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }).start();

      navigation.navigate('ProductDetails', product);

      // Reset opacity after navigation
      setTimeout(() => {
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 300);
    },
    [navigation, listOpacity],
  );

  const handleClearSearch = useCallback(() => {
    // Animate search bar scale
    Animated.sequence([
      Animated.timing(searchBarScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSearchInput('');
  }, [searchBarScale]);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('AddProduct');
  }, [navigation]);

  // Improved refresh handling
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    // Animate header during refresh
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

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
  }, [isSearching, refetchSearch, refetchProducts, queryClient, headerOpacity]);

  // Handle loading more products on scroll (only when not searching)
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isSearching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isSearching, fetchNextPage]);

  // Optimized sort handler with useCallback
  const handleSort = useCallback(
    (type: 'price' | 'createdAt', order: 'asc' | 'desc') => {
      setSortBy(type);
      setSortOrder(order);
      setShowSortMenu(false);

      // Animate list transition
      Animated.sequence([
        Animated.timing(listOpacity, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [listOpacity],
  );

  // Footer component to show loading indicator when fetching more products
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage || isSearching) return null;

    return (
      <View style={styles.footerLoader}>
        <LoadingAnimation size="small" type="dots" />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    );
  }, [isFetchingNextPage, isSearching]);

  const renderProduct = useCallback(
    ({item, index}: {item: Product; index: number}) => (
      <AnimatedProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        numColumns={numColumns}
        index={index}
      />
    ),
    [handleProductPress, numColumns],
  );

  const keyExtractor = useCallback((item: Product) => item._id, []);

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
    // Add skeleton container styles
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    searchLoadingText: {
      ...getFontStyle('regular', 16),
      color: colors.text,
      marginTop: 16,
    },
  });

  // Determine loading states
  const isInitialProductsLoading = !isSearching && isInitialLoading;
  const isSearchLoadingState = isSearching && isSearchLoading;
  const hasProductsError = !isSearching && productsError;
  const hasSearchError = isSearching && searchError;

  // Main content render
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
                {scale: searchBarScale},
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
        <Animated.View
          style={[styles.headerLandscape, {opacity: headerOpacity}]}>
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
        </Animated.View>
      );
    } else {
      return (
        <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
          <View style={styles.headerTop}>
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
                styles.headerActions,
                {
                  opacity: sortButtonAnim,
                  transform: [{scale: sortButtonAnim}],
                },
              ]}>
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
            </Animated.View>
          </View>

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
                  {scale: searchBarScale},
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
        </Animated.View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {renderMainContent()}

      {/* Animated Sort Menu */}
      {showSortMenu && (
        <Animated.View
          style={[
            styles.sortMenu,
            {
              transform: [{scale: sortMenuScale}],
              opacity: sortMenuScale,
            },
          ]}>
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
        </Animated.View>
      )}

      {/* Search result text */}
      {isSearching && !isSearchLoadingState && (
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

      {/* SKELETON LOADING - Only for initial product loading */}
      {isInitialProductsLoading ? (
        <View style={styles.skeletonContainer}>
          <ProductListSkeleton
            numColumns={numColumns}
            itemCount={numColumns * 3}
          />
        </View>
      ) : /* SEARCH LOADING - Different loading for search */
      isSearchLoadingState ? (
        <View style={styles.searchLoadingContainer}>
          <LoadingAnimation size="medium" type="dots" />
          <Text style={styles.searchLoadingText}>
            Searching all products...
          </Text>
        </View>
      ) : /* ERROR STATES */
      hasProductsError || hasSearchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {hasProductsError
              ? 'Error loading products'
              : 'Error searching products'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRefresh()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : /* EMPTY STATES */
      displayedProducts.length === 0 ? (
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
        /* PRODUCTS LIST */
        <Animated.View style={{flex: 1, opacity: listOpacity}}>
          <FlatList
            data={displayedProducts}
            keyExtractor={keyExtractor}
            renderItem={renderProduct}
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
            // Performance optimizations
            initialNumToRender={numColumns * 3}
            maxToRenderPerBatch={numColumns * 2}
            windowSize={10}
            removeClippedSubviews={true}
          />
        </Animated.View>
      )}

      {/* Keep the original FAB */}
      <Animated.View
        style={[
          {
            transform: [{scale: fabScale}],
          },
        ]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
          testID="add-product-button">
          <Icon name="plus" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProductsScreen;
