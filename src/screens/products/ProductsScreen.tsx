// src/screens/products/ProductsScreen.tsx
// Replace the existing ProductsScreen component with this updated version

import React, {useContext, useState, useCallback, useMemo} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import ProductCard from '../../components/products/ProductCard';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Product, productsApi} from '../../api/products';
import {useDebounce} from '../../hooks/useDebounce';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, toggleTheme, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
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
  } = useQuery({
    queryKey: ['searchProducts', debouncedSearch, sortBy, sortOrder],
    queryFn: async () => {
      // When searching, we need to get all products to search through them
      // This is a limitation of the API not having a proper search endpoint
      const allProductsData = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await productsApi.getProducts({
          page,
          limit: 50, // Get more products per page when searching
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

      // Now filter the products based on search term
      const searchTerm = debouncedSearch.toLowerCase().trim();

      const filtered = allProductsData.filter(product => {
        // Search in title
        if (product.title.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in description
        if (product.description.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search by price (exact match or range)
        const priceStr = product.price.toString();
        if (priceStr.includes(searchTerm)) {
          return true;
        }

        // If search term is a number, also match prices within a range
        const searchNumber = parseFloat(searchTerm);
        if (!isNaN(searchNumber)) {
          const priceDiff = Math.abs(product.price - searchNumber);
          // Match if price is within 10% of search number
          if (priceDiff <= searchNumber * 0.1) {
            return true;
          }
        }

        return false;
      });

      return filtered;
    },
    enabled: isSearching,
    staleTime: 30000, // Cache search results for 30 seconds
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
    enabled: !isSearching, // Only fetch paginated data when not searching
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

  const handleRefresh = useCallback(() => {
    if (isSearching) {
      // Refetch search results
      // queryClient.invalidateQueries(['searchProducts']);
    } else {
      refetchProducts();
    }
  }, [refetchProducts, isSearching]);

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
    if (isLandscape) {
      // Landscape layout - compact header with inline search
      return (
        <View style={styles.headerLandscape}>
          <Text
            style={[styles.title, {flex: 0, marginBottom: 0, marginRight: 16}]}>
            All Products
          </Text>

          <View style={[styles.searchBarContainer, {flex: 1, marginBottom: 0}]}>
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

          <TouchableOpacity
            onPress={() => setShowSortMenu(!showSortMenu)}
            style={{marginLeft: 12}}>
            <Icon name="sort" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme} style={{marginLeft: 12}}>
            <Icon
              name={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      // Portrait layout - standard stacked header
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

      {/* Responsive header with search bar */}
      {renderMainContent()}

      {/* Sort Menu */}
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

      {/* Search results count */}
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

      {/* Different content states */}
      {isLoading && displayedProducts.length === 0 ? (
        // Loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, {marginTop: 16}]}>
            {isSearching ? 'Searching all products...' : 'Loading products...'}
          </Text>
        </View>
      ) : error ? (
        // Error state
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading products</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRefresh()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : displayedProducts.length === 0 ? (
        // Empty state
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
        // Products list
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
              refreshing={isLoading && !isFetchingNextPage}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Always show Add button */}
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
