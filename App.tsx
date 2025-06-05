import React, {useEffect, useState, useRef} from 'react';
import {StatusBar, StyleSheet, View, Text} from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/context/ThemeContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './src/api/queryClient';
import AppLifecycleManager from './src/utils/appLifecycleManager';
import DeepLinkManager from './src/utils/deepLinkUtils';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

function App(): React.JSX.Element {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [lifecycleManagerInitialized, setLifecycleManagerInitialized] =
    useState(false);
  const [deepLinkInitialized, setDeepLinkInitialized] = useState(false);

  const navigationRef = useRef<NavigationContainerRef<any>>(null);

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

    // Initialize deep link manager
    const deepLinkManager = DeepLinkManager.getInstance();
    const deepLinkCleanup = deepLinkManager.init();
    setDeepLinkInitialized(true);

    // Cleanup function
    return () => {
      lifecycleManager.destroy();
      if (deepLinkCleanup) {
        deepLinkCleanup();
      }
    };
  }, []);

  useEffect(() => {
    // Set navigation ref for deep link manager once navigation is ready
    if (navigationRef.current && deepLinkInitialized) {
      const deepLinkManager = DeepLinkManager.getInstance();
      deepLinkManager.setNavigationRef(navigationRef.current);
    }
  }, [deepLinkInitialized]);

  const onNavigationReady = () => {
    console.log('🧭 Navigation container ready');
    if (navigationRef.current) {
      const deepLinkManager = DeepLinkManager.getInstance();
      deepLinkManager.setNavigationRef(navigationRef.current);
    }
  };

  if (!fontLoaded || !lifecycleManagerInitialized || !deepLinkInitialized) {
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
          <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
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
