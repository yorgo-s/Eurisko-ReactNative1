// App.tsx

import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {ThemeProvider} from './src/context/ThemeContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

function App(): React.JSX.Element {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Simulate font loading
    // In a real app, you might use a library like Expo Font or react-native-font-loader
    setTimeout(() => {
      setFontLoaded(true);
    }, 100);
  }, []);

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
