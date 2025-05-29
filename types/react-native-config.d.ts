declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL: string;
    GOOGLE_MAPS_API_KEY: string;
    APP_NAME: string;
    APP_VERSION: string;
    NODE_ENV: string;
    DEBUG_MODE: string;
    DEFAULT_LATITUDE: string;
    DEFAULT_LONGITUDE: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    MAX_IMAGE_SIZE_MB: string;
    MAX_IMAGES_PER_PRODUCT: string;
    CACHE_DURATION_MINUTES: string;
    QUERY_STALE_TIME_MINUTES: string;
    API_TIMEOUT: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
