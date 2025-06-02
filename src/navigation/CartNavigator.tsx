import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import CartScreen from '../screens/cart/CartScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import {ThemeContext} from '../context/ThemeContext';

const Stack = createStackNavigator();

const CartNavigator = () => {
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
        name="Cart"
        component={CartScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({route}: {route: {params?: {title?: string}}}) => ({
          title: route.params?.title || 'Product Details',
        })}
      />
    </Stack.Navigator>
  );
};

export default CartNavigator;
