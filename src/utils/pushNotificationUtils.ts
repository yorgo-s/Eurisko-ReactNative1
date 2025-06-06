// src/utils/pushNotificationUtils.ts
import {OneSignal, LogLevel} from 'react-native-onesignal';
import {Alert} from 'react-native';
import {Product} from '../api/products';

// OneSignal App ID - you'll need to get this from OneSignal dashboard
const ONESIGNAL_APP_ID = 'dafbce79-dc27-4940-9ce0-181cc802fd97'; // Add your OneSignal App ID here

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
      return;
    }

    try {
      console.log('🔔 Initializing OneSignal...');

      // Set debug log level (optional - remove in production)
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      // Initialize OneSignal with your App ID
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Request notification permission (iOS)
      OneSignal.Notifications.requestPermission(true);

      // Handle notification received while app is in foreground
      OneSignal.Notifications.addEventListener(
        'foregroundWillDisplay',
        event => {
          console.log(
            '🔔 OneSignal: notification will display in foreground:',
            event,
          );
          // You can modify the notification before it's displayed
          event.preventDefault();
          event.notification.display();
        },
      );

      // Handle notification opened/clicked
      OneSignal.Notifications.addEventListener('click', event => {
        console.log('🔔 OneSignal: notification clicked:', event);
        this.handleNotificationOpened(event);
      });

      this.isInitialized = true;
      console.log('✅ OneSignal initialized successfully');
    } catch (error) {
      console.error('❌ OneSignal initialization error:', error);
    }
  }

  private async handleNotificationOpened(event: any): Promise<void> {
    try {
      const additionalData = event.notification.additionalData;
      console.log('🔔 Additional data:', additionalData);

      if (additionalData?.productId) {
        // Navigate to product details
        await this.navigateToProduct(additionalData.productId);
      } else if (additionalData?.screen) {
        // Navigate to specific screen
        await this.navigateToScreen(additionalData.screen);
      }
    } catch (error) {
      console.error('❌ Error handling notification:', error);
    }
  }

  private async navigateToProduct(productId: string): Promise<void> {
    try {
      // Import navigation utilities
      const {default: DeepLinkManager} = await import('./deepLinkUtils');
      const deepLinkManager = DeepLinkManager.getInstance();

      // Use existing deep link functionality
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

  async sendProductAddedNotification(product: Product): Promise<void> {
    try {
      if (!ONESIGNAL_APP_ID) {
        console.warn('⚠️ OneSignal App ID not configured');
        return;
      }

      console.log('🔔 Sending product added notification for:', product.title);

      // This would typically be done from your backend
      // For demo purposes, we'll show how to send a notification
      const notificationData = {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: {
          en: '🛍️ New Product Added!',
        },
        contents: {
          en: `Check out ${product.title} for $${product.price.toFixed(2)}`,
        },
        data: {
          productId: product._id,
          type: 'product_added',
        },
        large_icon: product.images?.[0]?.url
          ? `https://backend-practice.eurisko.me${product.images[0].url}`
          : undefined,
        big_picture: product.images?.[0]?.url
          ? `https://backend-practice.eurisko.me${product.images[0].url}`
          : undefined,
      };

      // Note: In production, this should be sent from your backend
      console.log('🔔 Notification data prepared:', notificationData);
      console.log('⚠️ Note: Actual sending should be done from backend');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  async sendToUser(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ): Promise<void> {
    try {
      if (!ONESIGNAL_APP_ID) {
        console.warn('⚠️ OneSignal App ID not configured');
        return;
      }

      const notificationData = {
        app_id: ONESIGNAL_APP_ID,
        filters: [{field: 'tag', key: 'userId', relation: '=', value: userId}],
        headings: {en: title},
        contents: {en: message},
        data: data || {},
      };

      console.log('🔔 Sending notification to user:', userId, notificationData);
      console.log('⚠️ Note: Actual sending should be done from backend');
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
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
      console.error('❌ Error setting user tag:', error);
    }
  }

  async removeUserTag(key: string): Promise<void> {
    try {
      OneSignal.User.removeTag(key);
      console.log(`🗑️ Removed user tag: ${key}`);
    } catch (error) {
      console.error('❌ Error removing user tag:', error);
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
}

export default PushNotificationManager;
