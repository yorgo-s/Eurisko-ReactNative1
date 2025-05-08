// src/screens/products/ProductsScreen.tsx

import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {AuthContext} from '../../context/AuthContext';
import ProductCard from '../../components/products/ProductCard';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

// Define the product type
export type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id: string;
  }>;
};

const ProductsScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, toggleTheme, typography, getFontStyle} =
    useContext(ThemeContext);
  const {logout} = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  // Determine if we're in landscape orientation
  const isLandscape = windowWidth > windowHeight;

  // Determine number of columns based on orientation
  const numColumns = isLandscape ? 4 : 2;

  useEffect(() => {
    // Load products from the static data
    const loadProducts = async () => {
      try {
        // In a real app, we'd fetch from an API
        // For this assignment, we'll use the static data from the root Products.json file
        const productsJson = require('../../../Products.json');
        console.log('Products loaded:', productsJson.data.length);
        setProducts(productsJson.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', product);
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: Math.max(10, insets.top - 25),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...typography.heading2,
    },
    rightButtons: {
      flexDirection: 'row',
    },
    iconButton: {
      marginLeft: 16,
      padding: 8,
    },
    iconText: {
      ...getFontStyle('regular', 20),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: insets.top,
    },
    loadingText: {
      ...typography.body,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingTop: Math.max(20, insets.top),
    },
    emptyText: {
      ...typography.body,
      textAlign: 'center',
    },
    list: {
      padding: 8,
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
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
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
        <Text style={styles.title}>All Products</Text>
        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleTheme}
            testID="theme-toggle-button">
            <Text style={styles.iconText}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleLogout}
            testID="logout-button">
            <Text style={styles.iconText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={`grid-${numColumns}`} // Force re-render when columns change
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
    </SafeAreaView>
  );
};

export default ProductsScreen;
