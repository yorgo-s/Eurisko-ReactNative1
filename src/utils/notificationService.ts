// src/utils/notificationService.ts - SIMPLIFIED VERSION
interface NotificationOptions {
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImageUrl?: string;
  message?: string;
}

const notificationService = (options: NotificationOptions = {}) => {
  const url = 'https://api.onesignal.com/notifications?c=push';

  // Build the notification payload
  const payload: any = {
    app_id: 'dafbce79-dc27-4940-9ce0-181cc802fd97',
    contents: {en: options.message || 'Your message body here.'},
    included_segments: ['Test Users'],
  };

  // Add product-specific data if provided
  if (options.productId) {
    payload.url = `https://awesomeshop.app/product/${options.productId}`;
    payload.data = {
      productId: options.productId,
      type: 'product_notification',
    };
  }

  // Add image if provided
  if (options.productImageUrl) {
    payload.big_picture = options.productImageUrl;
  }

  // Add title if provided
  if (options.productTitle) {
    payload.headings = {en: options.productTitle};
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization:
        'os_v2_app_3l5446o4e5eubhhadaomqax5s7fgsywq6ylu4lvvknez65lnbbw2wsaptszgoyzmmdnrkvhhte674jvzckd5bokklq4iucbwfqg5ila',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  console.log('📤 Sending notification:', payload);

  return fetch(url, requestOptions)
    .then(res => res.json())
    .then(json => {
      console.log('✅ Notification sent:', json);
      return json;
    })
    .catch(err => {
      console.error('❌ Notification error:', err);
      throw err;
    });
};

// Simple helper functions
export const sendProductNotification = (
  productId: string,
  title: string,
  price: number,
  imageUrl?: string,
) => {
  return notificationService({
    productId,
    productTitle: title,
    productPrice: price,
    productImageUrl: imageUrl,
    message: `New product: ${title} - $${price.toFixed(2)}`,
  });
};

export const sendSimpleNotification = (message: string) => {
  return notificationService({message});
};

export default notificationService;
