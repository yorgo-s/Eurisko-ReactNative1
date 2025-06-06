// src/utils/pushNotificationUtils.ts - COMPLETE IMPLEMENTATION
import {OneSignal, LogLevel} from 'react-native-onesignal';
import {Alert, Platform} from 'react-native';
import {Product} from '../api/products';
import Config from 'react-native-config';

// Use environment variables for better security
const ONESIGNAL_APP_ID =
  Config.ONESIGNAL_APP_ID || 'dafbce79-dc27-4940-9ce0-181cc802fd97';
const ONESIGNAL_REST_API_KEY = Config.ONESIGNAL_REST_API_KEY;

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private isInitialized = false;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔔 OneSignal already initialized');
      return;
    }

    try {
      console.log('🔔 Initializing OneSignal...');

      // Validate App ID
      if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_APP_ID_HERE') {
        throw new Error('OneSignal App ID not configured properly');
      }

      // Set debug log level in development only
      if (__DEV__) {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      }

      // Initialize OneSignal
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Request notification permission
      const permission = await OneSignal.Notifications.requestPermission(true);
      console.log('🔔 Notification permission result:', permission);

      // Set up event listeners
      this.setupEventListeners();

      // Check initial subscription state
      await this.checkSubscriptionState();

      this.isInitialized = true;
      console.log('✅ OneSignal initialized successfully');

      // Log user ID for debugging
      const userId = await this.getUserId();
      if (userId) {
        console.log('🔔 OneSignal User ID:', userId);
      }
    } catch (error) {
      console.error('❌ OneSignal initialization error:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Handle notification received while app is in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      console.log('🔔 Notification will display in foreground:', event);

      // Show the notification (you can customize this)
      event.preventDefault();
      event.notification.display();
    });

    // Handle notification opened/clicked
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('🔔 Notification clicked:', event);
      this.handleNotificationOpened(event);
    });

    // Handle permission changes
    OneSignal.Notifications.addEventListener('permissionChange', permission => {
      console.log('🔔 Permission changed:', permission);
    });

    // Handle subscription changes
    OneSignal.User.addEventListener('pushSubscriptionChange', subscription => {
      console.log('🔔 Push subscription changed:', subscription);
    });
  }

  private async handleNotificationOpened(event: any): Promise<void> {
    try {
      const additionalData = event.notification.additionalData;
      console.log('🔔 Notification additional data:', additionalData);

      if (additionalData?.productId) {
        console.log('🔔 Navigating to product:', additionalData.productId);
        await this.navigateToProduct(additionalData.productId);
      } else if (additionalData?.screen) {
        console.log('🔔 Navigating to screen:', additionalData.screen);
        await this.navigateToScreen(additionalData.screen);
      } else {
        console.log('🔔 No specific navigation data, opening app normally');
      }
    } catch (error) {
      console.error('❌ Error handling notification:', error);
    }
  }

  private async navigateToProduct(productId: string): Promise<void> {
    try {
      const {default: DeepLinkManager} = await import('./deepLinkUtils');
      const deepLinkManager = DeepLinkManager.getInstance();
      const productUrl = `awesomeshop://product/${productId}`;
      deepLinkManager.testDeepLink(productUrl);
    } catch (error) {
      console.error('❌ Error navigating to product:', error);
    }
  }

  private async navigateToScreen(screen: string): Promise<void> {
    try {
      const {default: DeepLinkManager} = await import('./deepLinkUtils');
      const deepLinkManager = DeepLinkManager.getInstance();
      const screenUrl = `awesomeshop://${screen.toLowerCase()}`;
      deepLinkManager.testDeepLink(screenUrl);
    } catch (error) {
      console.error('❌ Error navigating to screen:', error);
    }
  }

  // COMPREHENSIVE TESTING METHODS
  async testBasicNotification(): Promise<void> {
    try {
      console.log('🧪 Testing basic notification...');

      const userId = await this.getUserId();
      if (!userId) {
        Alert.alert(
          'Error',
          'No OneSignal User ID found. Make sure notifications are initialized.',
        );
        return;
      }

      console.log('📱 Current OneSignal User ID:', userId);

      Alert.alert(
        'Test Notification Ready',
        `OneSignal User ID: ${userId}\n\nGo to OneSignal dashboard > Messages > New Push and target this User ID to test.`,
        [
          {text: 'OK'},
          {
            text: 'Copy User ID',
            onPress: () => {
              console.log('Copy this User ID:', userId);
              Alert.alert(
                'User ID Copied',
                `User ID: ${userId}\nCopied to console for manual copying.`,
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error('❌ Test notification error:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    }
  }

  async testProductNotification(
    productId: string,
    productTitle: string,
  ): Promise<void> {
    try {
      console.log('🧪 Testing product notification for:', productTitle);

      const notificationData = {
        type: 'product_added',
        productId: productId,
        title: '🛍️ New Product Added!',
        message: `Check out ${productTitle}`,
      };

      console.log('📱 Simulated notification data:', notificationData);

      // Test the navigation
      await this.handleTestNotificationClick(notificationData);
    } catch (error) {
      console.error('❌ Test product notification error:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    }
  }

  async handleTestNotificationClick(data: any): Promise<void> {
    try {
      console.log('🧪 Testing notification click handling:', data);

      if (data.productId) {
        await this.navigateToProduct(data.productId);
      }

      Alert.alert(
        'Test Notification Clicked',
        `Would navigate to product: ${data.productId}`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('❌ Error handling test notification:', error);
    }
  }

  async checkNotificationPermissions(): Promise<boolean> {
    try {
      const permission = await OneSignal.Notifications.getPermissionAsync();
      console.log('🔔 Notification permission status:', permission);

      if (!permission) {
        console.log('⚠️ Requesting notification permission...');
        const granted = await OneSignal.Notifications.requestPermission(true);
        console.log('📱 Permission granted:', granted);
        return granted;
      }

      return true;
    } catch (error) {
      console.error('❌ Permission check error:', error);
      return false;
    }
  }

  async debugUserInfo(): Promise<void> {
    try {
      const userId = await OneSignal.User.getOnesignalId();
      const pushSubscription = await OneSignal.User.getPushSubscription();
      const tags = await OneSignal.User.getTags();

      console.log('🔍 OneSignal Debug Info:');
      console.log('  User ID:', userId);
      console.log('  Push Subscription:', pushSubscription);
      console.log('  User Tags:', tags);

      Alert.alert(
        'OneSignal Debug Info',
        `User ID: ${userId || 'Not available'}\nPush Token: ${
          pushSubscription?.token ? 'Available' : 'Not available'
        }\nSubscribed: ${pushSubscription?.optedIn ? 'Yes' : 'No'}`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('❌ Debug info error:', error);
      Alert.alert('Error', `Debug failed: ${error.message}`);
    }
  }

  async testDeepLinkNavigation(): Promise<void> {
    try {
      console.log('🧪 Testing deep link navigation...');

      const testScenarios = [
        {type: 'product', productId: '0001', title: 'Test Product Navigation'},
        {type: 'cart', title: 'Test Cart Navigation'},
        {type: 'profile', title: 'Test Profile Navigation'},
      ];

      for (const scenario of testScenarios) {
        console.log(`🎯 Testing ${scenario.type} navigation...`);

        if (scenario.type === 'product' && scenario.productId) {
          await this.navigateToProduct(scenario.productId);
        } else {
          await this.navigateToScreen(scenario.type);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      Alert.alert(
        'Deep Link Test Complete',
        'Check console for navigation logs',
      );
    } catch (error) {
      console.error('❌ Deep link test error:', error);
      Alert.alert('Error', `Deep link test failed: ${error.message}`);
    }
  }

  async simulateBackendNotification(productData: any): Promise<void> {
    try {
      if (!ONESIGNAL_REST_API_KEY) {
        console.warn(
          '⚠️ OneSignal REST API key not configured - using simulation',
        );

        const simulatedNotification = {
          app_id: ONESIGNAL_APP_ID,
          included_segments: ['Subscribed Users'],
          headings: {en: '🛍️ New Product Added!'},
          contents: {
            en: `Check out ${
              productData.title
            } for $${productData.price.toFixed(2)}`,
          },
          data: {
            productId: productData._id,
            type: 'product_added',
          },
        };

        console.log(
          '🎭 Simulating backend notification:',
          simulatedNotification,
        );

        Alert.alert(
          'Backend Simulation',
          `Simulated sending notification for: ${productData.title}\n\nIn production, this would be sent from your backend server.`,
          [{text: 'OK'}],
        );
        return;
      }

      // Send real notification if REST API key is available
      const notificationData = {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: {en: '🛍️ New Product Added!'},
        contents: {
          en: `Check out ${productData.title} for $${productData.price.toFixed(
            2,
          )}`,
        },
        data: {
          productId: productData._id,
          type: 'product_added',
        },
      };

      const response = await fetch(
        'https://onesignal.com/api/v1/notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify(notificationData),
        },
      );

      const result = await response.json();
      console.log('✅ Notification sent:', result);

      Alert.alert(
        'Notification Sent!',
        `Successfully sent notification for ${productData.title}`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('❌ Backend simulation error:', error);
      Alert.alert('Error', `Failed to send notification: ${error.message}`);
    }
  }

  // EXISTING METHODS WITH IMPROVEMENTS
  async checkSubscriptionState(): Promise<any> {
    try {
      const subscription = await OneSignal.User.getPushSubscription();
      console.log('🔔 Current subscription state:', subscription);
      return subscription;
    } catch (error) {
      console.error('❌ Error checking subscription state:', error);
      return null;
    }
  }

  async checkPermissionStatus(): Promise<boolean> {
    try {
      const permission = await OneSignal.Notifications.getPermissionAsync();
      console.log('🔔 Current permission status:', permission);
      return permission;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  }

  async testNotificationFlow(): Promise<void> {
    try {
      console.log('🧪 Testing complete notification flow...');

      if (!this.isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      const hasPermission = await this.checkPermissionStatus();
      const subscription = await this.checkSubscriptionState();
      const userId = await this.getUserId();
      const tags = await this.getUserTags();

      console.log('🔔 Flow test results:', {
        hasPermission,
        subscription,
        userId,
        tags,
      });

      await this.setUserTag('test_mode', 'true');

      console.log('✅ Notification flow test completed');

      Alert.alert(
        'Notification Test Results',
        `Permission: ${hasPermission ? 'Granted' : 'Denied'}\nUser ID: ${
          userId || 'Not available'
        }\nSubscribed: ${
          subscription?.optedIn ? 'Yes' : 'No'
        }\nTest mode tag set: Yes`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('❌ Notification flow test failed:', error);
      Alert.alert('Test Failed', error.message);
    }
  }

  async sendProductAddedNotification(product: Product): Promise<void> {
    try {
      if (!ONESIGNAL_APP_ID) {
        console.warn('⚠️ OneSignal App ID not configured');
        return;
      }

      console.log('🔔 Preparing product notification for:', product.title);

      const imageUrl = product.images?.[0]?.url
        ? product.images[0].url.startsWith('http')
          ? product.images[0].url
          : `https://backend-practice.eurisko.me${product.images[0].url}`
        : undefined;

      const notificationData = {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: {en: '🛍️ New Product Added!'},
        contents: {
          en: `Check out ${product.title} for $${product.price.toFixed(2)}`,
        },
        data: {
          productId: product._id,
          type: 'product_added',
        },
        large_icon: imageUrl,
        big_picture: imageUrl,
        buttons: [
          {id: 'view_product', text: 'View Product'},
          {id: 'dismiss', text: 'Dismiss'},
        ],
      };

      console.log('🔔 Product notification prepared:', notificationData);
      console.log('⚠️ Note: Send this from your backend in production');
    } catch (error) {
      console.error('❌ Error preparing product notification:', error);
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const userId = await OneSignal.User.getOnesignalId();
      return userId || null;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  }

  async setUserTag(key: string, value: string): Promise<void> {
    try {
      OneSignal.User.addTag(key, value);
      console.log(`🏷️ Set user tag: ${key} = ${value}`);
    } catch (error) {
      console.error(`❌ Error setting user tag ${key}:`, error);
    }
  }

  async removeUserTag(key: string): Promise<void> {
    try {
      OneSignal.User.removeTag(key);
      console.log(`🗑️ Removed user tag: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing user tag ${key}:`, error);
    }
  }

  async setExternalUserId(externalId: string): Promise<void> {
    try {
      OneSignal.login(externalId);
      console.log(`👤 Set external user ID: ${externalId}`);
    } catch (error) {
      console.error('❌ Error setting external user ID:', error);
    }
  }

  async removeExternalUserId(): Promise<void> {
    try {
      OneSignal.logout();
      console.log('🗑️ Removed external user ID');
    } catch (error) {
      console.error('❌ Error removing external user ID:', error);
    }
  }

  async getUserTags(): Promise<any> {
    try {
      const tags = await OneSignal.User.getTags();
      console.log('🏷️ Current user tags:', tags);
      return tags;
    } catch (error) {
      console.error('❌ Error getting user tags:', error);
      return {};
    }
  }

  async canSendNotifications(): Promise<boolean> {
    try {
      const permission = await this.checkPermissionStatus();
      const subscription = await this.checkSubscriptionState();
      const userId = await this.getUserId();

      const canSend = permission && subscription?.optedIn && userId;
      console.log('🔔 Can send notifications:', canSend);

      return !!canSend;
    } catch (error) {
      console.error('❌ Error checking notification capability:', error);
      return false;
    }
  }
}

export default PushNotificationManager;
