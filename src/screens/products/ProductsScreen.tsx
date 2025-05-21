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
        limit: 6, // Fetch 6 products per page
      });
      return response;
    },
    initialPageParam: 1, // Added to fix the TypeScript error
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

    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    return results.filter(product => {
      // Check if all search terms are present in the product
      return searchTerms.every(term => {
        const title = product.title.toLowerCase();
        const description = product.description.toLowerCase();

        // Exact match for model numbers (like "14" in "iPhone 14")
        if (!isNaN(Number(term))) {
          // Look for the exact number with boundaries
          const modelRegex = new RegExp(`\\b${term}\\b`);
          return modelRegex.test(title) || modelRegex.test(description);
        }

        // For text terms, we can be a bit more lenient
        return title.includes(term) || description.includes(term);
      });
    });
  };

  // Query for search results with improved logic
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

        // If we got results, good. We'll filter them more precisely in our memo
        if (result.data && result.data.length > 0) {
          return result;
        }

        // If no results and we're searching for a specific model number,
        // try to get all products and filter client-side
        if (!isNaN(Number(debouncedSearch)) || debouncedSearch.match(/\d+/)) {
          const allProductsResult = await productsApi.getProducts({limit: 30});
          return {
            success: true,
            data: allProductsResult.data || [],
          };
        }

        return result;
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: isSearchActive && debouncedSearch.length > 0,
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

  // Get filtered search results
  const searchResults = React.useMemo(() => {
    if (!searchData?.data) return [];
    return getFilteredSearchResults(searchData.data, debouncedSearch);
  }, [searchData, debouncedSearch]);

  // Display products based on whether search is active or not
  const displayedProducts = isSearchActive ? searchResults : allProducts;

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
  const numColumns = isLandscape ? 4 : 2;

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: Math.max(16, insets.top),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      ...typography.heading2,
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
      padding: 10,
      ...getFontStyle('regular', 16),
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

  // Display loading state
  if (
    (isLoadingProducts && !displayedProducts.length) ||
    (isSearching && isSearchActive && !searchResults.length)
  ) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.emptyText}>
          {isSearchActive ? 'Searching...' : 'Loading products...'}
        </Text>
      </SafeAreaView>
    );
  }

  // Display error state
  if ((productsError && !isSearchActive) || (searchError && isSearchActive)) {
    const error = isSearchActive ? searchError : productsError;
    return (
      <SafeAreaView
        style={[styles.container, styles.errorContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Display empty state
  if (!displayedProducts.length) {
    return (
      <SafeAreaView
        style={[styles.container, styles.emptyContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.emptyText}>
          {isSearchActive
            ? `No products found matching "${debouncedSearch}"`
            : 'No products found. Check back later!'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
          testID="add-product-button">
          <Icon name="plus" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>All Products</Text>
          <TouchableOpacity onPress={toggleTheme}>
            <Icon
              name={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
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

      {isSearchActive && (
        <Text style={styles.searchResultText}>
          {searchResults.length > 0
            ? `Found ${searchResults.length} results for "${debouncedSearch}"`
            : `No products found matching "${debouncedSearch}"`}
        </Text>
      )}

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
