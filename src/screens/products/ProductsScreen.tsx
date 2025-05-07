import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {AuthContext} from '../../context/AuthContext';
import ProductCard from '../../components/products/ProductCard';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');
const scale = width / 375;

// Function to normalize font size based on screen width
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

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
  const {colors, isDarkMode, toggleTheme} = useContext(ThemeContext);
  const {logout} = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load products from the static data
    const loadProducts = async () => {
      try {
        // In a real app, we'd fetch from an API
        // For this assignment, we'll use the static data
        const productsJson = require('../../../Products.json');
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: normalize(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: normalize(20),
      fontWeight: 'bold',
      color: colors.text,
    },
    rightButtons: {
      flexDirection: 'row',
    },
    iconButton: {
      marginLeft: normalize(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: normalize(16),
      color: colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: normalize(20),
    },
    emptyText: {
      fontSize: normalize(16),
      color: colors.text,
      textAlign: 'center',
    },
    list: {
      padding: normalize(8),
    },
  });

  if (isLoading) {
    return (
      <View style={[dynamicStyles.container, dynamicStyles.loadingContainer]}>
        <Text style={dynamicStyles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[dynamicStyles.container, dynamicStyles.emptyContainer]}>
        <Text style={dynamicStyles.emptyText}>
          No products found. Check back later!
        </Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>All Products</Text>
        <View style={dynamicStyles.rightButtons}>
          <TouchableOpacity
            style={dynamicStyles.iconButton}
            onPress={toggleTheme}
            testID="theme-toggle-button">
            <Text style={{color: colors.text}}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.iconButton}
            onPress={logout}
            testID="logout-button">
            <Text style={{color: colors.text}}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
        numColumns={2}
        contentContainerStyle={dynamicStyles.list}
        testID="products-list"
      />
    </View>
  );
};

export default ProductsScreen;
