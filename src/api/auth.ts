import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: any; // For FormData, will need special handling
}

export interface LoginData {
  email: string;
  password: string;
  token_expires_in?: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: {url: string} | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export const authApi = {
  // Sign up new user
  signup: async (data: SignupData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);

    if (data.profileImage) {
      formData.append('profileImage', {
        uri: data.profileImage.uri,
        type: data.profileImage.type,
        name: data.profileImage.fileName || 'profileImage.jpg',
      });
    }

    const response = await apiClient.post('/api/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user
  login: async (data: LoginData) => {
    const response = await apiClient.post('/api/auth/login', data);

    if (response.data.success) {
      await AsyncStorage.setItem('@auth_token', response.data.data.accessToken);
      await AsyncStorage.setItem(
        '@refresh_token',
        response.data.data.refreshToken,
      );
    }

    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpData) => {
    const response = await apiClient.post('/api/auth/verify-otp', data);
    return response.data;
  },

  // Resend verification OTP
  resendVerificationOtp: async (email: string) => {
    const response = await apiClient.post('/api/auth/resend-verification-otp', {
      email,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    profileImage?: any;
  }) => {
    const formData = new FormData();

    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);

    if (data.profileImage) {
      formData.append('profileImage', {
        uri: data.profileImage.uri,
        type: data.profileImage.type,
        name: data.profileImage.fileName || 'profileImage.jpg',
      });
    }

    const response = await apiClient.put('/api/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Logout user
  logout: async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@refresh_token');
  },
};
