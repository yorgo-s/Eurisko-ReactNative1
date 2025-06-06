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
// import PushNotificationManager from './src/utils/pushNotificationUtils';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import {OneSignal, LogLevel} from 'react-native-onesignal';

function App(): React.JSX.Element {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [lifecycleManagerInitialized, setLifecycleManagerInitialized] =
    useState(false);
  const [deepLinkInitialized, setDeepLinkInitialized] = useState(false);
  const [pushNotificationsInitialized, setPushNotificationsInitialized] =
    useState(false);

  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    // Simulate font loading
    setTimeout(() => {
      setFontLoaded(true);
    }, 100);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize lifecycle manager
        const lifecycleManager = AppLifecycleManager.getInstance();
        lifecycleManager.init();
        setLifecycleManagerInitialized(true);

        // Initialize deep link manager
        const deepLinkManager = DeepLinkManager.getInstance();
        const deepLinkCleanup = deepLinkManager.init();
        setDeepLinkInitialized(true);

        // Initialize push notifications
        // const pushNotificationManager = PushNotificationManager.getInstance();
        // await pushNotificationManager.initialize();
        // setPushNotificationsInitialized(true);

        // Cleanup function will be returned for useEffect cleanup
        return () => {
          lifecycleManager.destroy();
          if (deepLinkCleanup) {
            deepLinkCleanup();
          }
        };
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Set initialized states to true even on error to prevent infinite loading
        setLifecycleManagerInitialized(true);
        setDeepLinkInitialized(true);
        setPushNotificationsInitialized(true);
      }
    };

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('dafbce79-dc27-4940-9ce0-181cc802fd97');
    OneSignal.Notifications.requestPermission(false);

    const cleanup = initializeApp();

    // Return cleanup function
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn && typeof cleanupFn === 'function') {
          cleanupFn();
        }
      });
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

  // Check if all initialization is complete
  const isAppReady =
    fontLoaded &&
    lifecycleManagerInitialized &&
    deepLinkInitialized &&
    pushNotificationsInitialized;

  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading application...</Text>
        <Text style={styles.loadingSubtext}>
          {!fontLoaded && '• Loading fonts...'}
          {!lifecycleManagerInitialized &&
            '• Initializing lifecycle manager...'}
          {!deepLinkInitialized && '• Setting up deep links...'}
          {!pushNotificationsInitialized && '• Configuring notifications...'}
        </Text>
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
    padding: 20,
  },
  loadingSubtext: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default App;
