import {AppState, AppStateStatus} from 'react-native';
import {useAuthStore} from '../store/authStore';

class AppLifecycleManager {
  private static instance: AppLifecycleManager;
  private appState: AppStateStatus = AppState.currentState;
  private lastActiveTime: number = Date.now();
  private checkTokenInterval: NodeJS.Timeout | null = null;

  // Time after which we should check token validity (5 minutes)
  private readonly TOKEN_CHECK_THRESHOLD = 5 * 60 * 1000;

  // Interval for checking tokens while app is active (every 5 minutes)
  private readonly CHECK_INTERVAL = 5 * 60 * 1000;

  static getInstance(): AppLifecycleManager {
    if (!AppLifecycleManager.instance) {
      AppLifecycleManager.instance = new AppLifecycleManager();
    }
    return AppLifecycleManager.instance;
  }

  init(): void {
    console.log('🔄 Initializing App Lifecycle Manager...');

    // Listen to app state changes
    AppState.addEventListener('change', this.handleAppStateChange);

    // Start periodic token checking
    this.startTokenChecking();

    // Initial token check
    this.checkTokenStatus();
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    console.log(
      `📱 App state changed from ${this.appState} to ${nextAppState}`,
    );

    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to foreground
      this.handleAppForeground();
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to background
      this.handleAppBackground();
    }

    this.appState = nextAppState;
  };

  private handleAppForeground = (): void => {
    console.log('🌟 App came to foreground');

    const timeSinceLastActive = Date.now() - this.lastActiveTime;

    if (timeSinceLastActive > this.TOKEN_CHECK_THRESHOLD) {
      console.log(
        `⏰ App was in background for ${Math.round(
          timeSinceLastActive / 1000 / 60,
        )} minutes, checking token status...`,
      );
      this.checkTokenStatus();
    }

    // Restart token checking
    this.startTokenChecking();
    this.lastActiveTime = Date.now();
  };

  private handleAppBackground = (): void => {
    console.log('🌙 App went to background');
    this.lastActiveTime = Date.now();

    // Stop token checking to save battery
    this.stopTokenChecking();
  };

  private startTokenChecking = (): void => {
    // Clear existing interval
    this.stopTokenChecking();

    // Start new interval
    this.checkTokenInterval = setInterval(() => {
      console.log('⏲️ Periodic token check...');
      this.checkTokenStatus();
    }, this.CHECK_INTERVAL);

    console.log('✅ Token checking started');
  };

  private stopTokenChecking = (): void => {
    if (this.checkTokenInterval) {
      clearInterval(this.checkTokenInterval);
      this.checkTokenInterval = null;
      console.log('⏹️ Token checking stopped');
    }
  };

  private checkTokenStatus = async (): Promise<void> => {
    try {
      const authStore = useAuthStore.getState();

      if (!authStore.isLoggedIn) {
        console.log('👤 User not logged in, skipping token check');
        return;
      }

      console.log('🔍 Checking token status...');

      const isTokenValid = await authStore.checkTokenExpiration();

      if (!isTokenValid) {
        console.log('⚠️ Token expired or expiring soon, attempting refresh...');

        const refreshSuccess = await authStore.refreshTokenIfNeeded();

        if (refreshSuccess) {
          console.log('✅ Token refreshed successfully');
        } else {
          console.log('❌ Token refresh failed, user will be logged out');
        }
      } else {
        console.log('✅ Token is still valid');
      }
    } catch (error) {
      console.error('❌ Error checking token status:', error);
    }
  };

  // Public method to manually trigger token check
  checkTokenNow = (): void => {
    console.log('🔍 Manual token check requested');
    this.checkTokenStatus();
  };

  // Cleanup method
  destroy = (): void => {
    console.log('🧹 Cleaning up App Lifecycle Manager...');

    AppState.removeEventListener('change', this.handleAppStateChange);
    this.stopTokenChecking();
  };
}

export default AppLifecycleManager;
