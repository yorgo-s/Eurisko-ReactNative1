import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/context/ThemeContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './src/api/queryClient';
import AppLifecycleManager from './src/utils/appLifecycleManager';
import 'react-native-gesture-handler';

function App(): React.JSX.Element {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [lifecycleManagerInitialized, setLifecycleManagerInitialized] =
    useState(false);

  useEffect(() => {
    // Simulate font loading
    setTimeout(() => {
      setFontLoaded(true);
    }, 100);
  }, []);

  useEffect(() => {
    // Initialize lifecycle manager
    const lifecycleManager = AppLifecycleManager.getInstance();
    lifecycleManager.init();
    setLifecycleManagerInitialized(true);

    // Cleanup function
    return () => {
      lifecycleManager.destroy();
    };
  }, []);

  if (!fontLoaded || !lifecycleManagerInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading application...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
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
