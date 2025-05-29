import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

// Log configuration on app start (development only)
if (Config.DEBUG_MODE === 'true' && __DEV__) {
  console.log('🔧 API Configuration:', {
    baseURL: Config.API_BASE_URL,
    timeout: Config.API_TIMEOUT,
    environment: Config.NODE_ENV,
    debug: Config.DEBUG_MODE,
  });
}

// Create a base axios instance with environment configuration
const apiClient = axios.create({
  baseURL: Config.API_BASE_URL || 'https://backend-practice.eurisko.me',
  timeout: parseInt(Config.API_TIMEOUT || '30000', 10),
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

    // Add debug logging in development
    if (Config.DEBUG_MODE === 'true' && __DEV__) {
      console.log('🔗 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  error => {
    if (Config.DEBUG_MODE === 'true' && __DEV__) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  },
);

// Add response interceptor to handle refresh token
apiClient.interceptors.response.use(
  response => {
    // Add debug logging in development
    if (Config.DEBUG_MODE === 'true' && __DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Add debug logging in development
    if (Config.DEBUG_MODE === 'true' && __DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

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
          `${Config.API_BASE_URL}/api/auth/refresh-token`,
          {
            refreshToken,
            token_expires_in: Config.ACCESS_TOKEN_EXPIRES_IN || '1y',
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

        if (Config.DEBUG_MODE === 'true' && __DEV__) {
          console.error('❌ Token Refresh Failed:', refreshError);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
