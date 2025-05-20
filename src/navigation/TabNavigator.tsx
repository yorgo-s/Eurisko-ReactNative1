import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ProductsNavigator from './ProductsNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {ThemeContext} from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const {colors, isDarkMode} = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#777777',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="ProductsTab"
        component={ProductsNavigator}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({color, size}) => (
            <Icon name="shopping" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
