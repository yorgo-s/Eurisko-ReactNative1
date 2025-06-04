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

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({resolve, reject}) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

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
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get the refresh token
        const refreshToken = await AsyncStorage.getItem('@refresh_token');

        if (!refreshToken) {
          // No refresh token, must login again
          processQueue(error, null);

          // Clear any stored tokens
          await AsyncStorage.multiRemove(['@auth_token', '@refresh_token']);

          // Import auth store to logout user
          const {useAuthStore} = await import('../store/authStore');
          const logout = useAuthStore.getState().logout;
          await logout();

          return Promise.reject(error);
        }

        console.log('🔄 Attempting to refresh token...');

        // Call refresh token endpoint
        const response = await axios.post(
          `${
            Config.API_BASE_URL || 'https://backend-practice.eurisko.me'
          }/api/auth/refresh-token`,
          {
            refreshToken,
            token_expires_in: Config.ACCESS_TOKEN_EXPIRES_IN || '1y',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: parseInt(Config.API_TIMEOUT || '30000', 10),
          },
        );

        // Store the new tokens
        if (response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken;

          await AsyncStorage.setItem('@auth_token', newAccessToken);
          await AsyncStorage.setItem('@refresh_token', newRefreshToken);

          // Update the Authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          console.log('✅ Token refreshed successfully');

          // Process the queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed: ' + response.data.message);
        }
      } catch (refreshError: any) {
        // If refresh fails, logout user
        console.error('❌ Token refresh failed:', refreshError);

        processQueue(refreshError, null);

        await AsyncStorage.multiRemove(['@auth_token', '@refresh_token']);

        // Import auth store to logout user
        try {
          const {useAuthStore} = await import('../store/authStore');
          const logout = useAuthStore.getState().logout;
          await logout();
        } catch (importError) {
          console.error('Failed to import auth store for logout:', importError);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other types of errors or if refresh was already attempted
    return Promise.reject(error);
  },
);

// Add a method to manually refresh token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshTokenValue = await AsyncStorage.getItem('@refresh_token');

    if (!refreshTokenValue) {
      return false;
    }

    const response = await axios.post(
      `${
        Config.API_BASE_URL || 'https://backend-practice.eurisko.me'
      }/api/auth/refresh-token`,
      {
        refreshToken: refreshTokenValue,
        token_expires_in: Config.ACCESS_TOKEN_EXPIRES_IN || '1y',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: parseInt(Config.API_TIMEOUT || '30000', 10),
      },
    );

    if (response.data.success) {
      await AsyncStorage.setItem('@auth_token', response.data.data.accessToken);
      await AsyncStorage.setItem(
        '@refresh_token',
        response.data.data.refreshToken,
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    return false;
  }
};

// Add a method to check if we have valid tokens
export const hasValidTokens = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem('@auth_token');
    const refreshToken = await AsyncStorage.getItem('@refresh_token');

    return !!(accessToken && refreshToken);
  } catch (error) {
    console.error('Error checking tokens:', error);
    return false;
  }
};

// Add a method to clear all tokens
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['@auth_token', '@refresh_token']);
    console.log('🧹 Tokens cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export default apiClient;
