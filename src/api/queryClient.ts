import {QueryClient} from '@tanstack/react-query';
import Config from 'react-native-config';

// Get configuration values from environment
const STALE_TIME =
  parseInt(Config.QUERY_STALE_TIME_MINUTES || '5', 10) * 60 * 1000; // Convert minutes to milliseconds
const GC_TIME = parseInt(Config.CACHE_DURATION_MINUTES || '30', 10) * 60 * 1000; // Convert minutes to milliseconds

// Create a client with environment-based configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME, // Changed from cacheTime to gcTime (new API)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      // Network mode configuration
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      // Network mode configuration
      networkMode: 'online',
    },
  },
});

// Add error handling for query client
queryClient.setMutationDefaults(['auth'], {
  retry: (failureCount, error) => {
    // Don't retry authentication errors
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as {response?: {status?: number}};
      if (
        apiError.response?.status === 401 ||
        apiError.response?.status === 403
      ) {
        return false;
      }
    }
    return failureCount < 1;
  },
});

// Log configuration in development
if (Config.DEBUG_MODE === 'true' && __DEV__) {
  console.log('⚡ Query Client Configuration:', {
    staleTimeMinutes: Config.QUERY_STALE_TIME_MINUTES,
    cacheTimeMinutes: Config.CACHE_DURATION_MINUTES,
    staleTimeMs: STALE_TIME,
    gcTimeMs: GC_TIME,
  });
}
