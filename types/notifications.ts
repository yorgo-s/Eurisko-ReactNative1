export interface NotificationDestination {
  type: 'product' | 'screen';
  productId?: string;
  screen?: string;
  timestamp: number;
}

export interface ProductNotificationData {
  type: 'product_added' | 'product_updated' | 'product_featured';
  productId: string;
  productTitle: string;
  productPrice: number;
  productImageUrl?: string;
}

export interface NotificationPayload {
  app_id: string;
  included_segments: string[];
  headings: Record<string, string>;
  contents: Record<string, string>;
  data: ProductNotificationData;
  android_channel_id?: string;
  android_sound?: string;
  ios_sound?: string;
  priority?: number;
  url?: string;
  web_url?: string;
  big_picture?: string;
  large_icon?: string;
  ios_attachments?: Record<string, string>;
}

export interface OneSignalNotification {
  notificationId: string;
  title?: string;
  body?: string;
  additionalData?: ProductNotificationData & Record<string, any>;
  launchURL?: string;
  sound?: string;
  badge?: number;
  actionButtons?: Array<{
    id: string;
    text: string;
    icon?: string;
  }>;
}

export interface NotificationClickEvent {
  notification: OneSignalNotification;
  result: {
    actionId?: string;
    url?: string;
  };
}

export interface NotificationReceivedEvent {
  notification: OneSignalNotification;
  preventDefault: () => void;
  display: () => void;
}

export interface PushSubscriptionState {
  userId?: string;
  pushToken?: string;
  isSubscribed: boolean;
  optedIn: boolean;
  emailSubscribed?: boolean;
  smsSubscribed?: boolean;
}

export interface NotificationPermission {
  hasPrompted: boolean;
  provisional: boolean;
  status: 'granted' | 'denied' | 'not_determined';
}

// Notification categories for better organization
export enum NotificationCategory {
  PRODUCT = 'product',
  ORDER = 'order',
  MARKETING = 'marketing',
  SYSTEM = 'system',
  SOCIAL = 'social',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
}

// User tag interface for targeting
export interface UserTag {
  key: string;
  value: string;
}

export interface NotificationTarget {
  userIds?: string[];
  segments?: string[];
  tags?: UserTag[];
  excludeUserIds?: string[];
}

// Configuration interface
export interface NotificationConfig {
  appId: string;
  restApiKey?: string;
  enableInAppAlerts?: boolean;
  enableForegroundNotifications?: boolean;
  autoRegister?: boolean;
  enableSound?: boolean;
  enableVibration?: boolean;
}
