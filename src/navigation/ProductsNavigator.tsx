import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import {ThemeContext} from '../context/ThemeContext';

const Stack = createStackNavigator();

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
        options={{title: 'All Products', headerShown: false}}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({route}) => ({
          title: route.params?.title || 'Product Details',
          headerShown: true, // Make sure header is shown
          headerTitleStyle: {
            ...getFontStyle('bold', 18),
          },
          headerTintColor: colors.text, // Color for the back button and title
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default ProductsNavigator;
