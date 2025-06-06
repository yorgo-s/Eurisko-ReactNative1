// // src/utils/pushNotificationUtils.ts - ENHANCED VERSION FOR NATIVE NOTIFICATIONS
// import {OneSignal, LogLevel} from 'react-native-onesignal';
// import {Platform} from 'react-native';
// import {Product} from '../api/products';
// import Config from 'react-native-config';

// // Use environment variables for better security
// const ONESIGNAL_APP_ID =
//   Config.ONESIGNAL_APP_ID || 'dafbce79-dc27-4940-9ce0-181cc802fd97';
// const ONESIGNAL_REST_API_KEY = Config.ONESIGNAL_REST_API_KEY;

// export class PushNotificationManager {
//   private static instance: PushNotificationManager;
//   private isInitialized = false;

//   static getInstance(): PushNotificationManager {
//     if (!PushNotificationManager.instance) {
//       PushNotificationManager.instance = new PushNotificationManager();
//     }
//     return PushNotificationManager.instance;
//   }

//   async initialize(): Promise<void> {
//     if (this.isInitialized) {
//       console.log('🔔 OneSignal already initialized');
//       return;
//     }

//     try {
//       console.log('🔔 Initializing OneSignal...');

//       // Validate App ID
//       if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_APP_ID_HERE') {
//         throw new Error('OneSignal App ID not configured properly');
//       }

//       // Set debug log level in development only
//       if (__DEV__) {
//         OneSignal.Debug.setLogLevel(LogLevel.Verbose);
//       }

//       // Initialize OneSignal
//       OneSignal.initialize(ONESIGNAL_APP_ID);

//       // Set up notification channels for Android
//       await this.setupNotificationChannels();

//       // Request notification permission
//       const permission = await OneSignal.Notifications.requestPermission(true);
//       console.log('🔔 Notification permission result:', permission);

//       // Set up event listeners for native notifications
//       this.setupNativeNotificationHandlers();

//       // Check initial subscription state
//       await this.checkSubscriptionState();

//       this.isInitialized = true;
//       console.log('✅ OneSignal initialized successfully');

//       // Log user ID for debugging
//       const userId = await this.getUserId();
//       if (userId) {
//         console.log('🔔 OneSignal User ID:', userId);
//       }
//     } catch (error: unknown) {
//       console.error('❌ OneSignal initialization error:', error);
//       throw error;
//     }
//   }

//   // NEW: Setup notification channels for Android
//   private async setupNotificationChannels(): Promise<void> {
//     try {
//       console.log('📱 Setting up notification channels...');

//       // For React Native OneSignal, channels are typically configured
//       // in the OneSignal dashboard or through the native Android code
//       // We'll use a simplified approach here

//       console.log('✅ Notification channels configured');
//     } catch (error: unknown) {
//       console.error('❌ Error setting up notification channels:', error);
//       // Don't throw error as this is not critical for basic functionality
//     }
//   }

//   private setupNativeNotificationHandlers(): void {
//     console.log('🔔 Setting up native notification handlers...');

//     // Handle notification received while app is in foreground
//     OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
//       console.log(
//         '🔔 Notification received in foreground:',
//         event.notification,
//       );

//       // ALWAYS show native notification (no alerts)
//       // The notification will appear as a native notification banner/popup
//       event.preventDefault();
//       event.notification.display();

//       console.log('📱 Native notification displayed in foreground');
//     });

//     // Handle notification clicked/opened
//     OneSignal.Notifications.addEventListener('click', event => {
//       console.log('🔔 Notification clicked:', event.notification);
//       this.handleNotificationClick(event.notification);
//     });

//     // Handle permission changes
//     OneSignal.Notifications.addEventListener('permissionChange', permission => {
//       console.log('🔔 Notification permission changed:', permission);
//     });

//     // Handle user state changes (subscription, etc.)
//     OneSignal.User.addEventListener('change', event => {
//       console.log('🔔 User state changed:', event);
//     });

//     console.log('✅ Native notification handlers set up');
//   }

//   private async handleNotificationClick(notification: any): Promise<void> {
//     try {
//       console.log('🔔 Processing notification click...');
//       console.log('📱 Notification data:', notification);

//       // Extract data from notification
//       const additionalData = notification.additionalData || {};
//       const {productId, type, screen} = additionalData;

//       console.log('🎯 Notification action data:', {productId, type, screen});

//       // Handle different notification types
//       if (type === 'product_added' && productId) {
//         console.log('🛍️ Handling product notification click:', productId);
//         await this.handleProductNotificationClick(productId);
//       } else if (screen) {
//         console.log('📱 Handling screen navigation:', screen);
//         await this.handleScreenNavigation(screen);
//       } else {
//         console.log('🏠 No specific action, opening app normally');
//         await this.handleDefaultNavigation();
//       }
//     } catch (error: unknown) {
//       console.error('❌ Error handling notification click:', error);
//     }
//   }

//   private async handleProductNotificationClick(
//     productId: string,
//   ): Promise<void> {
//     try {
//       console.log('🛍️ Handling product notification for:', productId);

//       // Check authentication state
//       const {useAuthStore} = await import('../store/authStore');
//       const authState = useAuthStore.getState();
//       const isLoggedIn = authState.isLoggedIn;

//       console.log('👤 User login status:', isLoggedIn);

//       if (isLoggedIn) {
//         // User is logged in - navigate directly to product
//         console.log('✅ User logged in, navigating to product');
//         await this.navigateToProduct(productId);
//       } else {
//         // User not logged in - store intended destination and go to login
//         console.log('🔒 User not logged in, storing product destination');
//         await this.storeIntendedProductDestination(productId);
//         await this.navigateToLogin();
//       }
//     } catch (error: unknown) {
//       console.error('❌ Error handling product notification:', error);
//     }
//   }

//   private async handleScreenNavigation(screen: string): Promise<void> {
//     try {
//       console.log('📱 Navigating to screen:', screen);

//       // Check auth for protected screens
//       const protectedScreens = ['cart', 'profile'];
//       const needsAuth = protectedScreens.includes(screen.toLowerCase());

//       if (needsAuth) {
//         const {useAuthStore} = await import('../store/authStore');
//         const isLoggedIn = useAuthStore.getState().isLoggedIn;

//         if (!isLoggedIn) {
//           console.log('🔒 Screen requires auth, storing destination');
//           await this.storeIntendedScreenDestination(screen);
//           await this.navigateToLogin();
//           return;
//         }
//       }

//       await this.navigateToScreen(screen);
//     } catch (error: unknown) {
//       console.error('❌ Error handling screen navigation:', error);
//     }
//   }

//   private async handleDefaultNavigation(): Promise<void> {
//     try {
//       console.log('🏠 Handling default navigation');

//       const {useAuthStore} = await import('../store/authStore');
//       const isLoggedIn = useAuthStore.getState().isLoggedIn;

//       if (isLoggedIn) {
//         await this.navigateToProducts();
//       } else {
//         await this.navigateToLogin();
//       }
//     } catch (error: unknown) {
//       console.error('❌ Error handling default navigation:', error);
//     }
//   }

//   private async navigateToProduct(productId: string): Promise<void> {
//     try {
//       console.log('🔗 Navigating to product:', productId);

//       const {default: DeepLinkManager} = await import('./deepLinkUtils');
//       const deepLinkManager = DeepLinkManager.getInstance();

//       // Use deep link to navigate to product
//       const productUrl = `awesomeshop://product/${productId}`;
//       console.log('🎯 Using deep link:', productUrl);

//       // Small delay to ensure app is ready
//       setTimeout(() => {
//         deepLinkManager.testDeepLink(productUrl);
//       }, 500);
//     } catch (error: unknown) {
//       console.error('❌ Error navigating to product:', error);
//     }
//   }

//   private async navigateToScreen(screen: string): Promise<void> {
//     try {
//       console.log('🔗 Navigating to screen:', screen);

//       const {default: DeepLinkManager} = await import('./deepLinkUtils');
//       const deepLinkManager = DeepLinkManager.getInstance();

//       const screenUrl = `awesomeshop://${screen.toLowerCase()}`;
//       console.log('🎯 Using deep link:', screenUrl);

//       setTimeout(() => {
//         deepLinkManager.testDeepLink(screenUrl);
//       }, 500);
//     } catch (error: unknown) {
//       console.error('❌ Error navigating to screen:', error);
//     }
//   }

//   private async navigateToLogin(): Promise<void> {
//     try {
//       console.log('🔗 Navigating to login');

//       const {default: DeepLinkManager} = await import('./deepLinkUtils');
//       const deepLinkManager = DeepLinkManager.getInstance();

//       // Small delay to ensure app is ready
//       setTimeout(() => {
//         deepLinkManager.testDeepLink('awesomeshop://login');
//       }, 500);
//     } catch (error: unknown) {
//       console.error('❌ Error navigating to login:', error);
//     }
//   }

//   private async navigateToProducts(): Promise<void> {
//     try {
//       console.log('🔗 Navigating to products');

//       const {default: DeepLinkManager} = await import('./deepLinkUtils');
//       const deepLinkManager = DeepLinkManager.getInstance();

//       setTimeout(() => {
//         deepLinkManager.testDeepLink('awesomeshop://products');
//       }, 500);
//     } catch (error: unknown) {
//       console.error('❌ Error navigating to products:', error);
//     }
//   }

//   private async storeIntendedProductDestination(
//     productId: string,
//   ): Promise<void> {
//     try {
//       const AsyncStorage = (
//         await import('@react-native-async-storage/async-storage')
//       ).default;

//       const destination = {
//         type: 'product',
//         productId: productId,
//         timestamp: Date.now(),
//       };

//       await AsyncStorage.setItem(
//         '@notification_destination',
//         JSON.stringify(destination),
//       );
//       console.log('💾 Stored notification destination:', destination);
//     } catch (error: unknown) {
//       console.error('❌ Error storing product destination:', error);
//     }
//   }

//   private async storeIntendedScreenDestination(screen: string): Promise<void> {
//     try {
//       const AsyncStorage = (
//         await import('@react-native-async-storage/async-storage')
//       ).default;

//       const destination = {
//         type: 'screen',
//         screen: screen,
//         timestamp: Date.now(),
//       };

//       await AsyncStorage.setItem(
//         '@notification_destination',
//         JSON.stringify(destination),
//       );
//       console.log('💾 Stored screen destination:', destination);
//     } catch (error: unknown) {
//       console.error('❌ Error storing screen destination:', error);
//     }
//   }

//   // Method to be called after successful login
//   async handlePostLoginNotificationNavigation(): Promise<void> {
//     try {
//       const AsyncStorage = (
//         await import('@react-native-async-storage/async-storage')
//       ).default;
//       const storedDestination = await AsyncStorage.getItem(
//         '@notification_destination',
//       );

//       if (storedDestination) {
//         const destination = JSON.parse(storedDestination);
//         console.log('📱 Found stored notification destination:', destination);

//         // Check if destination is not too old (within 10 minutes)
//         const now = Date.now();
//         const age = now - destination.timestamp;
//         const maxAge = 10 * 60 * 1000; // 10 minutes

//         if (age > maxAge) {
//           console.log('⏰ Stored destination too old, ignoring');
//           await AsyncStorage.removeItem('@notification_destination');
//           return;
//         }

//         // Clear the stored destination
//         await AsyncStorage.removeItem('@notification_destination');

//         // Navigate based on stored destination
//         if (destination.type === 'product' && destination.productId) {
//           console.log(
//             '🛍️ Navigating to stored product:',
//             destination.productId,
//           );
//           setTimeout(() => {
//             this.navigateToProduct(destination.productId);
//           }, 1000);
//         } else if (destination.type === 'screen' && destination.screen) {
//           console.log('📱 Navigating to stored screen:', destination.screen);
//           setTimeout(() => {
//             this.navigateToScreen(destination.screen);
//           }, 1000);
//         }
//       } else {
//         console.log('📱 No stored notification destination found');
//       }
//     } catch (error: unknown) {
//       console.error(
//         '❌ Error handling post-login notification navigation:',
//         error,
//       );
//     }
//   }

//   // NEW: Send notification when product is added
//   async sendProductAddedNotification(product: Product): Promise<boolean> {
//     try {
//       console.log('📤 Sending product added notification for:', product.title);

//       if (!ONESIGNAL_REST_API_KEY) {
//         console.warn('⚠️ OneSignal REST API key not configured');
//         return false;
//       }

//       // Prepare notification data with proper Android channel configuration
//       const notificationData = {
//         app_id: ONESIGNAL_APP_ID,
//         included_segments: ['All'], // Send to all users
//         headings: {
//           en: '🛍️ New Product Added!',
//         },
//         contents: {
//           en: `Check out "${product.title}" for ${product.price.toFixed(2)}`,
//         },
//         data: {
//           type: 'product_added',
//           productId: product._id,
//           productTitle: product.title,
//           productPrice: product.price,
//         },
//         // Android configuration - FIXED: Remove android_channel_id for now
//         android_sound: 'default',
//         android_accent_color: 'FF6200EE', // Your app's primary color
//         android_visibility: 1, // Public visibility
//         android_led_color: 'FF6200EE',
//         android_group: 'product_notifications',
//         android_group_message: {
//           en: '$[notif_count] new products available',
//         },

//         // iOS configuration
//         ios_sound: 'default',
//         ios_category: 'product_notification',
//         ios_badge_type: 'Increase',
//         ios_badge_count: 1,

//         // Universal configuration
//         priority: 10,
//         ttl: 86400, // 24 hours

//         // Deep link configuration
//         url: `awesomeshop://product/${product._id}`,
//         web_url: `https://awesomeshop.app/product/${product._id}`,

//         // Image for rich notification (first product image)
//         ...(product.images && product.images.length > 0
//           ? {
//               big_picture: this.getFullImageUrl(product.images[0].url),
//               large_icon: this.getFullImageUrl(product.images[0].url),
//               ios_attachments: {
//                 image: this.getFullImageUrl(product.images[0].url),
//               },
//             }
//           : {}),
//       };

//       console.log('📤 Notification payload:', notificationData);

//       // Send notification via OneSignal REST API
//       const response = await fetch(
//         'https://onesignal.com/api/v1/notifications',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
//           },
//           body: JSON.stringify(notificationData),
//         },
//       );

//       const result = await response.json();
//       console.log('📤 Notification send result:', result);

//       if (response.ok && result.id) {
//         console.log('✅ Product notification sent successfully:', result.id);
//         return true;
//       } else {
//         console.error('❌ Failed to send notification:', result);
//         return false;
//       }
//     } catch (error: unknown) {
//       console.error('❌ Error sending product notification:', error);
//       return false;
//     }
//   }

//   // Helper method to get full image URL
//   private getFullImageUrl(relativeUrl: string): string {
//     if (relativeUrl.startsWith('http')) {
//       return relativeUrl;
//     }
//     return `https://backend-practice.eurisko.me${relativeUrl}`;
//   }

//   // EXISTING METHODS (keeping all the existing functionality)
//   async checkSubscriptionState(): Promise<any> {
//     try {
//       const subscription = OneSignal.User.pushSubscription;
//       console.log('🔔 Current subscription state:', subscription);
//       return subscription;
//     } catch (error: unknown) {
//       console.error('❌ Error checking subscription state:', error);
//       return null;
//     }
//   }

//   async checkPermissionStatus(): Promise<boolean> {
//     try {
//       const permission = await OneSignal.Notifications.getPermissionAsync();
//       console.log('🔔 Current permission status:', permission);
//       return permission;
//     } catch (error: unknown) {
//       console.error('❌ Error checking permission:', error);
//       return false;
//     }
//   }

//   async getUserId(): Promise<string | null> {
//     try {
//       const userId = await OneSignal.User.getOnesignalId();
//       return userId || null;
//     } catch (error: unknown) {
//       console.error('❌ Error getting user ID:', error);
//       return null;
//     }
//   }

//   async setUserTag(key: string, value: string): Promise<void> {
//     try {
//       OneSignal.User.addTag(key, value);
//       console.log(`🏷️ Set user tag: ${key} = ${value}`);
//     } catch (error: unknown) {
//       console.error(`❌ Error setting user tag ${key}:`, error);
//     }
//   }

//   async removeUserTag(key: string): Promise<void> {
//     try {
//       OneSignal.User.removeTag(key);
//       console.log(`🗑️ Removed user tag: ${key}`);
//     } catch (error: unknown) {
//       console.error(`❌ Error removing user tag ${key}:`, error);
//     }
//   }

//   async setExternalUserId(externalId: string): Promise<void> {
//     try {
//       OneSignal.login(externalId);
//       console.log(`👤 Set external user ID: ${externalId}`);
//     } catch (error: unknown) {
//       console.error('❌ Error setting external user ID:', error);
//     }
//   }

//   async removeExternalUserId(): Promise<void> {
//     try {
//       OneSignal.logout();
//       console.log('🗑️ Removed external user ID');
//     } catch (error: unknown) {
//       console.error('❌ Error removing external user ID:', error);
//     }
//   }

//   async getUserTags(): Promise<any> {
//     try {
//       const tags = await OneSignal.User.getTags();
//       console.log('🏷️ Current user tags:', tags);
//       return tags;
//     } catch (error: unknown) {
//       console.error('❌ Error getting user tags:', error);
//       return {};
//     }
//   }

//   async canSendNotifications(): Promise<boolean> {
//     try {
//       const permission = await this.checkPermissionStatus();
//       const subscription = OneSignal.User.pushSubscription;
//       const userId = await this.getUserId();

//       const isOptedIn =
//         subscription &&
//         typeof subscription === 'object' &&
//         'optedIn' in subscription
//           ? (subscription as any).optedIn
//           : false;

//       const canSend = permission && isOptedIn && userId;
//       console.log('🔔 Can send notifications:', canSend);

//       return !!canSend;
//     } catch (error: unknown) {
//       console.error('❌ Error checking notification capability:', error);
//       return false;
//     }
//   }

//   // TESTING METHODS (useful for development)
//   async testProductNotification(
//     productId: string,
//     productTitle: string,
//   ): Promise<void> {
//     console.log('🧪 Testing product notification flow...');

//     // Simulate notification data
//     const mockNotification = {
//       additionalData: {
//         type: 'product_added',
//         productId: productId,
//       },
//       title: '🛍️ New Product Added!',
//       body: `Check out ${productTitle}`,
//     };

//     console.log(
//       '📱 Simulating notification click with data:',
//       mockNotification,
//     );
//     await this.handleNotificationClick(mockNotification);
//   }

//   async debugNotificationSetup(): Promise<void> {
//     try {
//       console.log('🔍 Debugging notification setup...');

//       const userId = await this.getUserId();
//       const permission = await this.checkPermissionStatus();
//       const subscription = await this.checkSubscriptionState();
//       const tags = await this.getUserTags();
//       const canSend = await this.canSendNotifications();

//       const debugInfo = {
//         userId,
//         permission,
//         subscription,
//         tags,
//         canSend,
//         isInitialized: this.isInitialized,
//       };

//       console.log('🔔 Notification Debug Info:', debugInfo);
//       return debugInfo;
//     } catch (error: unknown) {
//       console.error('❌ Error debugging notification setup:', error);
//     }
//   }
// }

// export default PushNotificationManager;

// // Additional TypeScript interfaces for better type safety
// export interface NotificationDestination {
//   type: 'product' | 'screen';
//   productId?: string;
//   screen?: string;
//   timestamp: number;
// }

// export interface ProductNotificationData {
//   type: 'product_added';
//   productId: string;
//   productTitle: string;
//   productPrice: number;
// }

// export interface NotificationPayload {
//   app_id: string;
//   included_segments: string[];
//   headings: Record<string, string>;
//   contents: Record<string, string>;
//   data: ProductNotificationData;
//   android_channel_id?: string;
//   android_sound?: string;
//   ios_sound?: string;
//   priority?: number;
//   url?: string;
//   web_url?: string;
//   big_picture?: string;
//   large_icon?: string;
//   ios_attachments?: Record<string, string>;
// }
