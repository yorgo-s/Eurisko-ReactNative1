// src/screens/products/ProductsScreen.tsx

import React, {useContext, useState, useCallback} from 'react';
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
  const debouncedSearch = useDebounce(searchInput, 500); // Debounce search input

  // State to track whether we're searching
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
  const numColumns = isLandscape ? 4 : 2;

  // Infinite query for products
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({pageParam}) => {
      const response = await productsApi.getProducts({
        page: pageParam,
        limit: isLandscape ? 8 : 6, // Fetch more in landscape mode
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
    enabled: !isSearchActive,
  });

  // Function to filter search results more precisely
  const getFilteredSearchResults = (results: Product[], query: string) => {
    if (!query.trim()) return results;

    // If no results directly from API search, implement client-side search
    if (results.length === 0) {
      // Try to get all products and filter client-side
      return allProducts.filter(product => {
        const title = product.title.toLowerCase();
        const description = product.description.toLowerCase();
        const searchTerms = query.toLowerCase().trim().split(/\s+/);

        return searchTerms.every(term => {
          // For numbers, look for exact matches
          if (!isNaN(Number(term))) {
            return title.includes(term) || description.includes(term);
          }

          // For text terms, check for inclusion
          return title.includes(term) || description.includes(term);
        });
      });
    }

    return results;
  };

  // Query for search results with improved error handling
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['productSearch', debouncedSearch],
    queryFn: async () => {
      try {
        // First try the API's search endpoint
        const result = await productsApi.searchProducts(debouncedSearch);

        return result;
      } catch (error) {
        console.error('Search error:', error);
        // Return empty results on error instead of throwing
        return {success: true, data: []};
      }
    },
    enabled: isSearchActive && debouncedSearch.length > 0,
    // Don't throw errors, handle them gracefully
    throwOnError: false,
    // Return empty data on error
    placeholderData: {success: true, data: []},
  });

  // Update search active state when search input changes
  React.useEffect(() => {
    setIsSearchActive(debouncedSearch.length > 0);
  }, [debouncedSearch]);

  // Flatten the pages of products for display
  const allProducts = React.useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(page => page.data || []);
  }, [productsData]);

  // Get search results
  const searchResults = React.useMemo(() => {
    // First check if we have search data from the API
    const searchResultsFromApi = searchData?.data || [];

    // If we got no results from API search, try local filtering
    if (
      isSearchActive &&
      searchResultsFromApi.length === 0 &&
      debouncedSearch.trim()
    ) {
      return getFilteredSearchResults([], debouncedSearch);
    }

    return searchResultsFromApi;
  }, [searchData, debouncedSearch, isSearchActive, allProducts]);

  // Display products based on whether search is active or not
  const displayedProducts = isSearchActive ? searchResults : allProducts;

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', product);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setIsSearchActive(false);
  };

  const handleSearch = () => {
    if (searchInput.trim().length > 0) {
      setIsSearchActive(true);
      refetchSearch();
    }
  };

  const handleAddProduct = () => {
    // This will be implemented in a future increment
    console.log('Add product pressed');
  };

  const handleRefresh = useCallback(() => {
    if (isSearchActive) {
      refetchSearch();
    } else {
      refetchProducts();
    }
  }, [refetchProducts, refetchSearch, isSearchActive]);

  // Handle loading more products on scroll
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isSearchActive) {
      fetchNextPage();
    }
  };

  // Footer component to show loading indicator when fetching more products
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

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
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              testID="search-input"
            />
            {searchInput ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.searchButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}>
                <Icon name="magnify" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={toggleTheme} style={{marginLeft: 16}}>
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
            <TouchableOpacity onPress={toggleTheme}>
              <Icon
                name={
                  isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'
                }
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              testID="search-input"
            />
            {searchInput ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.searchButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}>
                <Icon name="magnify" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
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
    title: {
      ...typography.heading2,
      fontSize: isLandscape ? 22 : 24, // Smaller title in landscape
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.card : '#F0F0F0',
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      padding: isLandscape ? 8 : 10, // Smaller padding in landscape
      ...getFontStyle('regular', isLandscape ? 14 : 16), // Smaller text in landscape
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
  });

  // Always render the header with search bar
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Responsive header with search bar */}
      {renderMainContent()}

      {/* Search results count (if applicable) */}
      {isSearchActive && (
        <Text
          style={[
            styles.searchResultText,
            isLandscape && {marginTop: 4, marginBottom: 4},
          ]}>
          {searchResults.length > 0
            ? `Found ${searchResults.length} results for "${debouncedSearch}"`
            : `No products found matching "${debouncedSearch}"`}
        </Text>
      )}

      {/* Different content states */}
      {(isLoadingProducts && !displayedProducts.length) ||
      (isSearching && isSearchActive && !searchResults.length) ? (
        // Loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>
            {isSearchActive ? 'Searching...' : 'Loading products...'}
          </Text>
        </View>
      ) : productsError && !isSearchActive ? (
        // Error state for main products (only show if not searching)
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading products</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchProducts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !displayedProducts.length ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isSearchActive
              ? `No products found matching "${debouncedSearch}"`
              : 'No products found. Check back later!'}
          </Text>
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
          key={numColumns} // Force re-render when column count changes
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          testID="products-list"
          refreshControl={
            <RefreshControl
              refreshing={isLoadingProducts || isSearching}
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
