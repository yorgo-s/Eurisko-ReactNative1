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

  static getInstance(): DeepLinkManager {
    if (!DeepLinkManager.instance) {
      DeepLinkManager.instance = new DeepLinkManager();
    }
    return DeepLinkManager.instance;
  }

  setNavigationRef(ref: NavigationContainerRef<any>): void {
    this.navigationRef = ref;

    // Process any pending URL that came in before navigation was ready
    if (this.pendingURL) {
      this.handleDeepLink(this.pendingURL);
      this.pendingURL = null;
    }
  }

  init(): () => void {
    // Handle app opened via deep link when app is closed
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('📱 App opened with initial URL:', url);
        if (this.navigationRef) {
          this.handleDeepLink(url);
        } else {
          this.pendingURL = url;
        }
      }
    });

    // Handle app opened via deep link when app is running
    const handleUrl = (event: {url: string}) => {
      console.log('📱 App opened with URL:', event.url);
      this.handleDeepLink(event.url);
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // Return cleanup function
    return () => {
      subscription?.remove();
    };
  }

  private handleDeepLink(url: string): void {
    if (!this.navigationRef) {
      this.pendingURL = url;
      return;
    }

    try {
      const params = this.parseDeepLink(url);
      console.log('🔗 Parsed deep link params:', params);

      this.navigateBasedOnParams(params);
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  private parseDeepLink(url: string): DeepLinkParams {
    console.log('🔍 Parsing URL:', url);

    // Handle different URL schemes
    if (url.startsWith('awesomeshop://')) {
      return this.parseCustomScheme(url);
    } else if (url.startsWith('https://awesomeshop.app/')) {
      return this.parseHTTPSUrl(url);
    }

    return {};
  }

  private parseCustomScheme(url: string): DeepLinkParams {
    // Format: awesomeshop://product/123 or awesomeshop://products/123
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment);

    const params: DeepLinkParams = {};

    if (pathSegments[0] === 'product' && pathSegments[1]) {
      params.productId = pathSegments[1];
      params.screen = 'ProductDetails';
    } else if (pathSegments[0] === 'products' && pathSegments[1]) {
      params.productId = pathSegments[1];
      params.screen = 'ProductDetails';
    } else if (pathSegments[0] === 'cart') {
      params.screen = 'Cart';
    } else if (pathSegments[0] === 'profile') {
      params.screen = 'Profile';
    }

    // Parse query parameters
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  private parseHTTPSUrl(url: string): DeepLinkParams {
    // Format: https://awesomeshop.app/product/123
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment);

    const params: DeepLinkParams = {};

    if (pathSegments[0] === 'product' && pathSegments[1]) {
      params.productId = pathSegments[1];
      params.screen = 'ProductDetails';
    } else if (pathSegments[0] === 'products' && pathSegments[1]) {
      params.productId = pathSegments[1];
      params.screen = 'ProductDetails';
    }

    // Parse query parameters
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  private async navigateBasedOnParams(params: DeepLinkParams): Promise<void> {
    if (!this.navigationRef) {
      console.warn('⚠️ Navigation ref not available');
      return;
    }

    // Import auth store to check login status
    const {useAuthStore} = await import('../store/authStore');
    const isLoggedIn = useAuthStore.getState().isLoggedIn;

    console.log('👤 User logged in:', isLoggedIn);
    console.log('🎯 Navigation params:', params);

    // If trying to access product details
    if (params.screen === 'ProductDetails' && params.productId) {
      if (isLoggedIn) {
        // User is logged in, navigate to product details
        console.log('✅ Navigating to product details for logged in user');
        this.navigateToProductDetails(params.productId);
      } else {
        // User not logged in, store the intended destination and go to login
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
    } else {
      // Default navigation to products screen
      if (isLoggedIn) {
        this.navigateToProducts();
      } else {
        this.navigateToLogin();
      }
    }
  }

  private navigateToProductDetails(productId: string): void {
    if (!this.navigationRef) return;

    // First navigate to the products tab, then to product details
    this.navigationRef.navigate('ProductsTab', {
      screen: 'ProductDetails',
      params: {_id: productId},
    });
  }

  private navigateToCart(): void {
    if (!this.navigationRef) return;
    this.navigationRef.navigate('CartTab');
  }

  private navigateToProfile(): void {
    if (!this.navigationRef) return;
    this.navigationRef.navigate('ProfileTab');
  }

  private navigateToProducts(): void {
    if (!this.navigationRef) return;
    this.navigationRef.navigate('ProductsTab');
  }

  private navigateToLogin(): void {
    if (!this.navigationRef) return;
    this.navigationRef.navigate('Login');
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

        // Clear the stored destination
        await AsyncStorage.removeItem('@intended_destination');

        // Navigate to the intended destination
        setTimeout(() => {
          this.navigateBasedOnParams(params);
        }, 500); // Small delay to ensure navigation is ready
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
}

export default DeepLinkManager;
