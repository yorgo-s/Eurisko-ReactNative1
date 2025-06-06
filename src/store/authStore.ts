// src/store/authStore.ts - COMPLETE SIMPLIFIED VERSION
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi, User} from '../api/auth';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  tokenExpirationTime: number | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profileImage?: any,
  ) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: {
    firstName?: string;
    lastName?: string;
    profileImage?: any;
  }) => Promise<boolean>;
  clearError: () => void;
  checkTokenExpiration: () => Promise<boolean>;
  refreshTokenIfNeeded: () => Promise<boolean>;

  // Simple notification methods
  setupNotificationTags: () => Promise<void>;
  clearNotificationTags: () => Promise<void>;
}

// Helper function to calculate token expiration time
const calculateTokenExpiration = (expiresIn: string): number => {
  const now = Date.now();

  // Parse the expires_in string (e.g., "1h", "30m", "1y")
  const match = expiresIn.match(/^(\d+)([mhdy])$/);
  if (!match) {
    // Default to 1 hour if format is invalid
    return now + 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let milliseconds = 0;
  switch (unit) {
    case 'm':
      milliseconds = value * 60 * 1000;
      break;
    case 'h':
      milliseconds = value * 60 * 60 * 1000;
      break;
    case 'd':
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    case 'y':
      milliseconds = value * 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      milliseconds = 60 * 60 * 1000; // 1 hour default
  }

  return now + milliseconds;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,
      tokenExpirationTime: null,

      login: async (email, password) => {
        try {
          console.log('Attempting login with:', email);
          set({isLoading: true, error: null});

          const response = await authApi.login({
            email,
            password,
            token_expires_in: '1y', // Set a reasonable expiration time
          });
          console.log('Login response:', response);

          if (response.success) {
            console.log(
              'Login successful, storing tokens and fetching profile...',
            );

            // Calculate token expiration time
            const expirationTime = calculateTokenExpiration('1y');
            set({tokenExpirationTime: expirationTime});

            // After successful login, fetch user profile
            await get().fetchUserProfile();
            set({isLoggedIn: true, isLoading: false});

            // Setup notification tags after successful login
            try {
              await get().setupNotificationTags();
            } catch (notificationError) {
              console.error(
                '❌ Error setting up notification tags:',
                notificationError,
              );
              // Don't fail login if notifications fail
            }

            console.log('Login flow complete, isLoggedIn set to true');

            // Handle post-login navigation for deep links
            try {
              const {default: DeepLinkManager} = await import(
                '../utils/deepLinkUtils'
              );
              const deepLinkManager = DeepLinkManager.getInstance();
              await deepLinkManager.handlePostLoginNavigation();
            } catch (error) {
              console.error('Error handling post-login navigation:', error);
            }

            return true;
          } else {
            console.log('Login failed response:', response);
            set({isLoading: false, error: 'Login failed'});
            return false;
          }
        } catch (error: any) {
          console.log(
            'Login error:',
            error.response?.data || error.message || error,
          );
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Login failed',
          });
          return false;
        }
      },

      signup: async (firstName, lastName, email, password, profileImage) => {
        try {
          set({isLoading: true, error: null});
          const response = await authApi.signup({
            firstName,
            lastName,
            email,
            password,
            profileImage,
          });

          if (response.success) {
            set({isLoading: false});
            return true;
          } else {
            set({isLoading: false, error: 'Signup failed'});
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Signup failed',
          });
          return false;
        }
      },

      verifyOtp: async (email, otp) => {
        try {
          set({isLoading: true, error: null});
          const response = await authApi.verifyOtp({email, otp});

          if (response.success) {
            set({isLoading: false});
            return true;
          } else {
            set({isLoading: false, error: 'OTP verification failed'});
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.error?.message || 'OTP verification failed',
          });
          return false;
        }
      },

      logout: async () => {
        try {
          // Clear notification tags before logout
          try {
            await get().clearNotificationTags();
          } catch (notificationError) {
            console.error(
              '❌ Error clearing notification tags:',
              notificationError,
            );
            // Don't fail logout if notifications fail
          }

          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear everything regardless of API call success
          set({
            isLoggedIn: false,
            user: null,
            tokenExpirationTime: null,
            error: null,
          });
        }
      },

      fetchUserProfile: async () => {
        try {
          set({isLoading: true, error: null});

          // Check if token needs refresh before making the request
          const tokenRefreshed = await get().refreshTokenIfNeeded();
          if (!tokenRefreshed) {
            throw new Error('Unable to refresh token');
          }

          const response = await authApi.getProfile();

          if (response.success) {
            set({user: response.data.user, isLoading: false});
          } else {
            set({isLoading: false, error: 'Failed to fetch profile'});
          }
        } catch (error: any) {
          console.error('Fetch profile error:', error);

          // If it's an auth error, logout the user
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            console.log('Auth error during profile fetch, logging out...');
            await get().logout();
            return;
          }

          set({
            isLoading: false,
            error:
              error.response?.data?.error?.message || 'Failed to fetch profile',
          });
        }
      },

      updateUserProfile: async data => {
        try {
          console.log('Updating profile with data:', data);
          set({isLoading: true, error: null});

          // Check if token needs refresh before making the request
          const tokenRefreshed = await get().refreshTokenIfNeeded();
          if (!tokenRefreshed) {
            throw new Error('Unable to refresh token');
          }

          const response = await authApi.updateProfile(data);
          console.log('Update profile response:', response);

          if (response.success) {
            set({user: response.data.user, isLoading: false});

            // Update notification tags when profile is updated
            try {
              await get().setupNotificationTags();
            } catch (notificationError) {
              console.error(
                '❌ Error updating notification tags:',
                notificationError,
              );
              // Don't fail profile update if notifications fail
            }

            console.log('Profile updated successfully');
            return true;
          } else {
            console.log('Profile update failed:', response);
            set({isLoading: false, error: 'Failed to update profile'});
            return false;
          }
        } catch (error: any) {
          console.error('Update profile error:', error);

          // If it's an auth error, logout the user
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            console.log('Auth error during profile update, logging out...');
            await get().logout();
            return false;
          }

          set({
            isLoading: false,
            error:
              error.response?.data?.error?.message ||
              'Failed to update profile',
          });
          return false;
        }
      },

      checkTokenExpiration: async () => {
        const {tokenExpirationTime, isLoggedIn} = get();

        if (!isLoggedIn || !tokenExpirationTime) {
          return false;
        }

        const now = Date.now();
        const timeUntilExpiry = tokenExpirationTime - now;

        // If token expires in less than 5 minutes, consider it expired
        const BUFFER_TIME = 5 * 60 * 1000; // 5 minutes

        return timeUntilExpiry > BUFFER_TIME;
      },

      refreshTokenIfNeeded: async () => {
        try {
          const isTokenValid = await get().checkTokenExpiration();

          if (isTokenValid) {
            return true; // Token is still valid
          }

          console.log('Token expired or expiring soon, attempting refresh...');

          const refreshToken = await AsyncStorage.getItem('@refresh_token');
          if (!refreshToken) {
            console.log('No refresh token found, logging out...');
            await get().logout();
            return false;
          }

          // Import the API client to use the refresh endpoint directly
          const {default: apiClient} = await import('../api/apiClient');

          const response = await apiClient.post('/api/auth/refresh-token', {
            refreshToken,
            token_expires_in: '1y',
          });

          if (response.data.success) {
            console.log('Token refreshed successfully');

            // Update token expiration time
            const expirationTime = calculateTokenExpiration('1y');
            set({tokenExpirationTime: expirationTime});

            return true;
          } else {
            console.log('Token refresh failed, logging out...');
            await get().logout();
            return false;
          }
        } catch (error: any) {
          console.error('Token refresh error:', error);

          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            console.log('Refresh token is invalid, logging out...');
            await get().logout();
          }

          return false;
        }
      },

      // SIMPLIFIED notification tag setup
      setupNotificationTags: async () => {
        try {
          const {user} = get();
          if (!user) {
            console.log('🔔 No user found, skipping notification tags setup');
            return;
          }

          console.log('🔔 Setting up notification tags for user:', user.email);
          const {OneSignal} = await import('react-native-onesignal');

          OneSignal.login(user.id);
          OneSignal.User.addTag('userId', user.id);
          OneSignal.User.addTag('email', user.email);
          OneSignal.User.addTag('firstName', user.firstName);
          OneSignal.User.addTag('lastName', user.lastName);

          console.log('✅ Notification tags set successfully');
        } catch (error) {
          console.error('❌ Error setting notification tags:', error);
          // Don't throw error to avoid breaking auth flow
        }
      },

      // SIMPLIFIED notification cleanup
      clearNotificationTags: async () => {
        try {
          console.log('🔔 Clearing notification tags');
          const {OneSignal} = await import('react-native-onesignal');

          OneSignal.logout();

          console.log('✅ Notification tags cleared successfully');
        } catch (error) {
          console.error('❌ Error clearing notification tags:', error);
          // Don't throw error to avoid breaking auth flow
        }
      },

      clearError: () => set({error: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        tokenExpirationTime: state.tokenExpirationTime,
      }),
      // Add version to handle migration if needed
      version: 1,
      // Handle rehydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth store rehydration error:', error);
        } else if (state) {
          // Check token expiration on app start
          state.checkTokenExpiration().then(isValid => {
            if (!isValid && state.isLoggedIn) {
              console.log('Token expired on app start, attempting refresh...');
              state.refreshTokenIfNeeded();
            }
          });
        }
      },
    },
  ),
);

export default useAuthStore;
