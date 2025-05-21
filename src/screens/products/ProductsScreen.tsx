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
import {Product} from '../../api/products';
import {useProducts, useSearchProducts} from '../../hooks/useProducts';
import {useDebounce} from '../../hooks/useDebounce';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, toggleTheme, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500); // Debounce search input

  // Using our custom hooks for products data
  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
    pagination,
    nextPage,
    prevPage,
    updateParams,
  } = useProducts();

  const {searchResults, isLoading: isSearching, search} = useSearchProducts();

  // Determine if we're in search mode
  const isSearchMode = debouncedSearch.length > 0;

  // Combined data source - either search results or regular products
  const displayedProducts = isSearchMode ? searchResults : products;

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
  const numColumns = isLandscape ? 4 : 2;

  // Update search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', product);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const handleAddProduct = () => {
    // This will be implemented in Increment 5
    console.log('Add product pressed');
  };

  const handleRefresh = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  const renderFooter = () => {
    if (!pagination || (!pagination.hasNextPage && !pagination.hasPrevPage)) {
      return null;
    }

    return (
      <View style={styles.paginationContainer}>
        {pagination.hasPrevPage && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={prevPage}
            disabled={isLoadingProducts}>
            <Icon name="chevron-left" size={24} color={colors.text} />
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.paginationInfo}>
          Page {pagination.currentPage} of {pagination.totalPages}
        </Text>

        {pagination.hasNextPage && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={nextPage}
            disabled={isLoadingProducts}>
            <Text style={styles.paginationText}>Next</Text>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
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
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    paginationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    paginationText: {
      ...getFontStyle('medium', 16),
      color: colors.primary,
    },
    paginationInfo: {
      ...getFontStyle('regular', 14),
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
    (isSearching && isSearchMode && !searchResults.length)
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
          {isSearchMode ? 'Searching...' : 'Loading products...'}
        </Text>
      </SafeAreaView>
    );
  }

  // Display error state
  if (productsError && !isSearchMode) {
    return (
      <SafeAreaView
        style={[styles.container, styles.errorContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>
          Error loading products: {productsError}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchProducts()}>
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
          {isSearchMode
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
            testID="search-input"
          />
          {searchInput ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.searchButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <Icon name="magnify" size={24} color={colors.text} />
          )}
        </View>
      </View>

      {isSearchMode && (
        <Text style={styles.searchResultText}>
          {searchResults.length > 0
            ? `Found ${searchResults.length} results for "${debouncedSearch}"`
            : ''}
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
            refreshing={isLoadingProducts}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (!isSearchMode && pagination?.hasNextPage) {
            nextPage();
          }
        }}
        onEndReachedThreshold={0.3}
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
