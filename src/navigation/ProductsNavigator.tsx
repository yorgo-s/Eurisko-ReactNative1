import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';
import {ThemeContext} from '../context/ThemeContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Stack = createStackNavigator();

// Wrap ProductDetailsScreen with ErrorBoundary
const SafeProductDetailsScreen = (props: any) => (
  <ErrorBoundary>
    <ProductDetailsScreen {...props} />
  </ErrorBoundary>
);

const ProductsNavigator = () => {
  const {colors, getFontStyle} = useContext(ThemeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          ...getFontStyle('bold', 18),
        },
      }}>
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductDetails"
        component={SafeProductDetailsScreen}
        options={({route}: {route: {params?: {title?: string}}}) => ({
          title: route.params?.title || 'Product Details',
        })}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProductsNavigator;
