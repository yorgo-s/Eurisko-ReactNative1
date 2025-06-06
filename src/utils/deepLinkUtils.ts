// src/utils/deepLinkUtils.ts - FIXED VERSION
import {Linking} from 'react-native';
import {NavigationContainerRef} from '@react-navigation/native';

export interface DeepLinkParams {
  productId?: string;
  screen?: string;
  [key: string]: any;
}

export class DeepLinkManager {
  private static instance: DeepLinkManager;
  private navigationRef: NavigationContainerRef<any> | null = null;
  private pendingURL: string | null = null;
  private isNavigationReady = false;

  static getInstance(): DeepLinkManager {
    if (!DeepLinkManager.instance) {
      DeepLinkManager.instance = new DeepLinkManager();
    }
    return DeepLinkManager.instance;
  }

  setNavigationRef(ref: NavigationContainerRef<any>): void {
    this.navigationRef = ref;
    this.isNavigationReady = true;

    // Process any pending URL that came in before navigation was ready
    if (this.pendingURL) {
      console.log(
        '🔗 Processing pending URL after navigation ready:',
        this.pendingURL,
      );
      setTimeout(() => {
        this.handleDeepLink(this.pendingURL!);
        this.pendingURL = null;
      }, 1000);
    }
  }

  init(): () => void {
    console.log('🚀 Initializing Deep Link Manager...');

    // Handle app opened via deep link when app is closed
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log('📱 App opened with initial URL:', url);
          if (this.isNavigationReady && this.navigationRef) {
            setTimeout(() => {
              this.handleDeepLink(url);
            }, 1500);
          } else {
            console.log('📱 Navigation not ready, storing pending URL');
            this.pendingURL = url;
          }
        }
      })
      .catch(error => {
        console.error('❌ Error getting initial URL:', error);
      });

    // Handle app opened via deep link when app is running
    const handleUrl = (event: {url: string}) => {
      console.log('📱 App opened with URL while running:', event.url);
      if (this.isNavigationReady && this.navigationRef) {
        this.handleDeepLink(event.url);
      } else {
        this.pendingURL = event.url;
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription?.remove();
    };
  }

  private async handleDeepLink(url: string): Promise<void> {
    if (!this.navigationRef || !this.isNavigationReady) {
      console.log('📱 Navigation not ready, storing pending URL');
      this.pendingURL = url;
      return;
    }

    try {
      const params = this.parseDeepLink(url);
      console.log('🔗 Parsed deep link params:', params);

      await this.navigateBasedOnParams(params);
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  private parseDeepLink(url: string): DeepLinkParams {
    console.log('🔍 Parsing URL:', url);

    try {
      // Handle different URL schemes
      if (url.startsWith('awesomeshop://')) {
        return this.parseCustomScheme(url);
      } else if (url.startsWith('https://awesomeshop.app/')) {
        return this.parseHTTPSUrl(url);
      }
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
    }

    return {};
  }

  private parseCustomScheme(url: string): DeepLinkParams {
    try {
      console.log('🔍 Parsing custom scheme URL:', url);

      // For custom schemes, we need to handle them differently
      // Format: awesomeshop://product/123 or awesomeshop://cart

      // Remove the scheme and get the path
      const urlWithoutScheme = url.replace('awesomeshop://', '');
      const pathSegments = urlWithoutScheme
        .split('/')
        .filter(segment => segment);

      console.log('🔍 Path segments:', pathSegments);

      const params: DeepLinkParams = {};

      if (pathSegments.length > 0) {
        const firstSegment = pathSegments[0];

        if (
          (firstSegment === 'product' || firstSegment === 'products') &&
          pathSegments[1]
        ) {
          params.productId = pathSegments[1];
          params.screen = 'ProductDetails';
          console.log('🔍 Detected product link:', params);
        } else if (firstSegment === 'cart') {
          params.screen = 'Cart';
          console.log('🔍 Detected cart link:', params);
        } else if (firstSegment === 'profile') {
          params.screen = 'Profile';
          console.log('🔍 Detected profile link:', params);
        } else if (firstSegment === 'products') {
          params.screen = 'Products';
          console.log('🔍 Detected products list link:', params);
        }
      }

      // Parse query parameters if present
      const queryStartIndex = url.indexOf('?');
      if (queryStartIndex !== -1) {
        const queryString = url.substring(queryStartIndex + 1);
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }

      return params;
    } catch (error) {
      console.error('❌ Error parsing custom scheme URL:', error);
      return {};
    }
  }

  private parseHTTPSUrl(url: string): DeepLinkParams {
    try {
      console.log('🔍 Parsing HTTPS URL:', url);

      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname
        .split('/')
        .filter(segment => segment);

      console.log('🔍 HTTPS Path segments:', pathSegments);

      const params: DeepLinkParams = {};

      if (pathSegments.length > 0) {
        const firstSegment = pathSegments[0];

        if (
          (firstSegment === 'product' || firstSegment === 'products') &&
          pathSegments[1]
        ) {
          params.productId = pathSegments[1];
          params.screen = 'ProductDetails';
        } else if (firstSegment === 'cart') {
          params.screen = 'Cart';
        } else if (firstSegment === 'profile') {
          params.screen = 'Profile';
        } else if (firstSegment === 'products') {
          params.screen = 'Products';
        }
      }

      // Parse query parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return params;
    } catch (error) {
      console.error('❌ Error parsing HTTPS URL:', error);
      return {};
    }
  }

  private async navigateBasedOnParams(params: DeepLinkParams): Promise<void> {
    if (!this.navigationRef || !this.isNavigationReady) {
      console.warn('⚠️ Navigation ref not available or not ready');
      return;
    }

    try {
      const {useAuthStore} = await import('../store/authStore');
      const isLoggedIn = useAuthStore.getState().isLoggedIn;

      console.log('👤 User logged in:', isLoggedIn);
      console.log('🎯 Navigation params:', params);

      if (params.screen === 'ProductDetails' && params.productId) {
        if (isLoggedIn) {
          console.log('✅ Navigating to product details for logged in user');
          this.navigateToProductDetails(params.productId);
        } else {
          console.log('🔒 User not logged in, redirecting to login');
          await this.storeIntendedDestination(params);
          this.navigateToLogin();
        }
      } else if (params.screen === 'Cart') {
        if (isLoggedIn) {
          this.navigateToCart();
        } else {
          await this.storeIntendedDestination(params);
          this.navigateToLogin();
        }
      } else if (params.screen === 'Profile') {
        if (isLoggedIn) {
          this.navigateToProfile();
        } else {
          await this.storeIntendedDestination(params);
          this.navigateToLogin();
        }
      } else if (params.screen === 'Products') {
        if (isLoggedIn) {
          this.navigateToProducts();
        } else {
          this.navigateToLogin();
        }
      } else {
        if (isLoggedIn) {
          this.navigateToProducts();
        } else {
          this.navigateToLogin();
        }
      }
    } catch (error) {
      console.error('❌ Error in navigation based on params:', error);
    }
  }

  private navigateToProductDetails(productId: string): void {
    if (!this.navigationRef) return;

    try {
      console.log('🔗 Navigating to product details:', productId);

      this.navigationRef.reset({
        index: 0,
        routes: [
          {
            name: 'ProductsTab',
            state: {
              routes: [
                {name: 'Products'},
                {
                  name: 'ProductDetails',
                  params: {_id: productId, title: 'Product Details'},
                },
              ],
              index: 1,
            },
          },
        ],
      });
    } catch (error) {
      console.error('❌ Error navigating to product details:', error);
      this.navigationRef.navigate('ProductsTab', {
        screen: 'ProductDetails',
        params: {_id: productId},
      });
    }
  }

  private navigateToCart(): void {
    if (!this.navigationRef) return;

    try {
      console.log('🔗 Navigating to cart');
      this.navigationRef.navigate('CartTab');
    } catch (error) {
      console.error('❌ Error navigating to cart:', error);
    }
  }

  private navigateToProfile(): void {
    if (!this.navigationRef) return;

    try {
      console.log('🔗 Navigating to profile');
      this.navigationRef.navigate('ProfileTab');
    } catch (error) {
      console.error('❌ Error navigating to profile:', error);
    }
  }

  private navigateToProducts(): void {
    if (!this.navigationRef) return;

    try {
      console.log('🔗 Navigating to products');
      this.navigationRef.navigate('ProductsTab');
    } catch (error) {
      console.error('❌ Error navigating to products:', error);
    }
  }

  private navigateToLogin(): void {
    if (!this.navigationRef) return;

    try {
      console.log('🔗 Navigating to login');
      this.navigationRef.navigate('Login');
    } catch (error) {
      console.error('❌ Error navigating to login:', error);
    }
  }

  private async storeIntendedDestination(
    params: DeepLinkParams,
  ): Promise<void> {
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      await AsyncStorage.setItem(
        '@intended_destination',
        JSON.stringify(params),
      );
      console.log('💾 Stored intended destination:', params);
    } catch (error) {
      console.error('❌ Error storing intended destination:', error);
    }
  }

  async handlePostLoginNavigation(): Promise<void> {
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      const storedDestination = await AsyncStorage.getItem(
        '@intended_destination',
      );

      if (storedDestination) {
        const params: DeepLinkParams = JSON.parse(storedDestination);
        console.log('📱 Navigating to stored destination:', params);

        await AsyncStorage.removeItem('@intended_destination');

        setTimeout(() => {
          this.navigateBasedOnParams(params);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error handling post-login navigation:', error);
    }
  }

  // Utility methods for generating deep links
  static generateProductLink(productId: string): string {
    return `awesomeshop://product/${productId}`;
  }

  static generateHTTPSProductLink(productId: string): string {
    return `https://awesomeshop.app/product/${productId}`;
  }

  static generateCartLink(): string {
    return `awesomeshop://cart`;
  }

  static generateProfileLink(): string {
    return `awesomeshop://profile`;
  }

  // Public method to test deep links
  testDeepLink(url: string): void {
    console.log('🧪 Testing deep link:', url);
    this.handleDeepLink(url);
  }

  // Reset pending URL (useful for testing)
  resetPendingUrl(): void {
    this.pendingURL = null;
  }
}

export default DeepLinkManager;
