import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SignUpScreen from '../screens/auth/SignUpScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import TabNavigator from './TabNavigator';
import {useAuthStore} from '../store/authStore';
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

const AppNavigator = () => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  return isLoggedIn ? <TabNavigator /> : <AuthStack />;
};

export default AppNavigator;
