// src/navigation/AppNavigator.tsx

import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SignUpScreen from '../screens/auth/SignUpScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import {AuthContext} from '../context/AuthContext';
import {ThemeContext} from '../context/ThemeContext';

const Stack = createStackNavigator();

const AuthStack = () => {
  const {colors, getFontStyle} = useContext(ThemeContext);

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          ...getFontStyle('bold', 18),
        },
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const ProductStack = () => {
  const {colors, getFontStyle} = useContext(ThemeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
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
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const {isLoggedIn} = useContext(AuthContext);

  return isLoggedIn ? <ProductStack /> : <AuthStack />;
};

export default AppNavigator;
