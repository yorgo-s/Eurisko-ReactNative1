import React, {useContext, useEffect, useState} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import ProductCard from '../../components/products/ProductCard';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Product} from '../../api/products';
import {useProductStore} from '../../store/productStore';

const ProductsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, toggleTheme, typography, getFontStyle} =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Use the product store
  const {products, isLoading, error, fetchProducts, searchProducts} =
    useProductStore();

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
  const numColumns = isLandscape ? 4 : 2;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', product);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  const handleAddProduct = () => {
    // This will be implemented in Increment 5
    console.log('Add product pressed');
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
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.emptyText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, styles.errorContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorText}>Error loading products: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchProducts()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!products.length) {
    return (
      <SafeAreaView
        style={[styles.container, styles.emptyContainer]}
        edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.emptyText}>
          No products found. Check back later!
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            testID="search-input"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.searchButton}>
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

      <FlatList
        data={products}
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
