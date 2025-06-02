import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';
import {ThemeContext} from '../context/ThemeContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import {
  slideFromRightTransition,
  scaleTransition,
  slideFromBottomTransition,
} from '../utils/screenTransitions';

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
        // Default smooth transition
        ...slideFromRightTransition,
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
          ...scaleTransition, // Special transition for product details
        })}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{
          headerShown: false,
          ...slideFromBottomTransition, // Modal-style transition for adding products
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          headerShown: false,
          ...slideFromBottomTransition, // Modal-style transition for editing
        }}
      />
    </Stack.Navigator>
  );
};

export default ProductsNavigator;
