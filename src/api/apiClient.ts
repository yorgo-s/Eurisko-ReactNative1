import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a base axios instance
const apiClient = axios.create({
  baseURL: 'YOUR_API_BASE_URL', // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async config => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('@auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle refresh token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the refresh token
        const refreshToken = await AsyncStorage.getItem('@refresh_token');

        if (!refreshToken) {
          // No refresh token, must login again
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          'YOUR_API_BASE_URL/api/auth/refresh-token',
          {
            refreshToken,
            token_expires_in: '1y', // or whatever duration you want
          },
        );

        // Store the new tokens
        if (response.data.success) {
          await AsyncStorage.setItem(
            '@auth_token',
            response.data.data.accessToken,
          );
          await AsyncStorage.setItem(
            '@refresh_token',
            response.data.data.refreshToken,
          );

          // Update the Authorization header
          apiClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${response.data.data.accessToken}`;

          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
