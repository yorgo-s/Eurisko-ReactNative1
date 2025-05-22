import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi, User} from '../api/auth';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          console.log('Attempting login with:', email, password);
          set({isLoading: true, error: null});

          const response = await authApi.login({email, password});
          console.log('Login response:', response);

          if (response.success) {
            console.log('Login successful, fetching profile...');
            // After successful login, fetch user profile
            await get().fetchUserProfile();
            set({isLoggedIn: true, isLoading: false});
            console.log('Login flow complete, isLoggedIn set to true');
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
        await authApi.logout();
        set({isLoggedIn: false, user: null});
      },

      fetchUserProfile: async () => {
        try {
          set({isLoading: true, error: null});
          const response = await authApi.getProfile();

          if (response.success) {
            set({user: response.data.user, isLoading: false});
          } else {
            set({isLoading: false, error: 'Failed to fetch profile'});
          }
        } catch (error: any) {
          console.error('Fetch profile error:', error);
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

          const response = await authApi.updateProfile(data);
          console.log('Update profile response:', response);

          if (response.success) {
            set({user: response.data.user, isLoading: false});
            console.log('Profile updated successfully');
            return true;
          } else {
            console.log('Profile update failed:', response);
            set({isLoading: false, error: 'Failed to update profile'});
            return false;
          }
        } catch (error: any) {
          console.error('Update profile error:', error);
          set({
            isLoading: false,
            error:
              error.response?.data?.error?.message ||
              'Failed to update profile',
          });
          return false;
        }
      },

      clearError: () => set({error: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({isLoggedIn: state.isLoggedIn, user: state.user}),
    },
  ),
);
