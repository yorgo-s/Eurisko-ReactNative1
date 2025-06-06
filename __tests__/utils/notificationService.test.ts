import {
  sendProductNotification,
  sendSimpleNotification,
} from '../../src/utils/notificationService';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('NotificationService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('sendProductNotification', () => {
    it('should send product notification with correct payload', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'notification-id',
          recipients: 1,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const productId = 'product-123';
      const title = 'Test Product';
      const price = 29.99;
      const imageUrl = 'https://example.com/image.jpg';

      await sendProductNotification(productId, title, price, imageUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.onesignal.com/notifications?c=push',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: expect.stringContaining('os_v2_app_'),
          }),
          body: expect.stringContaining(
            '"app_id":"dafbce79-dc27-4940-9ce0-181cc802fd97"',
          ),
        }),
      );

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody).toMatchObject({
        app_id: 'dafbce79-dc27-4940-9ce0-181cc802fd97',
        contents: {en: 'New product: Test Product - $29.99'},
        headings: {en: 'Test Product'},
        included_segments: ['Test Users'],
        url: 'awesomeshop://product/product-123',
        big_picture: 'https://example.com/image.jpg',
        data: {
          productId: 'product-123',
          type: 'product_notification',
        },
      });
    });

    it('should handle notification without image URL', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendProductNotification('product-123', 'Test Product', 29.99);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody).not.toHaveProperty('big_picture');
    });

    it('should handle fetch errors gracefully', async () => {
      const error = new Error('Network error');
      mockFetch.mockRejectedValue(error);

      await expect(
        sendProductNotification('product-123', 'Test Product', 29.99),
      ).rejects.toThrow('Network error');

      expect(console.error).toHaveBeenCalledWith(
        '❌ Notification error:',
        error,
      );
    });

    it('should handle API error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({errors: ['Invalid request']}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await sendProductNotification(
        'product-123',
        'Test Product',
        29.99,
      );

      expect(result).toEqual({errors: ['Invalid request']});
    });

    it('should format price correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendProductNotification('product-123', 'Test Product', 99.5);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody.contents.en).toBe(
        'New product: Test Product - $99.50',
      );
    });

    it('should handle special characters in product title', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const specialTitle = 'Test "Product" & More!';
      await sendProductNotification('product-123', specialTitle, 29.99);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody.headings.en).toBe(specialTitle);
    });

    it('should generate correct deep link URL', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const productId = 'special-product-123';
      await sendProductNotification(productId, 'Test Product', 29.99);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody.url).toBe(`awesomeshop://product/${productId}`);
    });
  });

  describe('sendSimpleNotification', () => {
    it('should send simple notification with message only', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const message = 'Hello, World!';
      await sendSimpleNotification(message);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody).toMatchObject({
        app_id: 'dafbce79-dc27-4940-9ce0-181cc802fd97',
        contents: {en: 'Hello, World!'},
        included_segments: ['Test Users'],
      });
      expect(requestBody).not.toHaveProperty('url');
      expect(requestBody).not.toHaveProperty('data');
    });

    it('should handle empty message', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendSimpleNotification('');

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody.contents.en).toBe('');
    });

    it('should handle long messages', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const longMessage = 'A'.repeat(500);
      await sendSimpleNotification(longMessage);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );
      expect(requestBody.contents.en).toBe(longMessage);
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      await expect(sendSimpleNotification('Test message')).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should log successful notifications', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'notification-id',
          recipients: 100,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendSimpleNotification('Test message');

      expect(console.log).toHaveBeenCalledWith('✅ Notification sent:', {
        id: 'notification-id',
        recipients: 100,
      });
    });
  });

  describe('notification payload validation', () => {
    it('should include all required OneSignal fields', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendProductNotification('product-123', 'Test Product', 29.99);

      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string,
      );

      // Required OneSignal fields
      expect(requestBody).toHaveProperty('app_id');
      expect(requestBody).toHaveProperty('contents');
      expect(requestBody).toHaveProperty('included_segments');

      // Check contents structure
      expect(requestBody.contents).toHaveProperty('en');
      expect(typeof requestBody.contents.en).toBe('string');

      // Check segments
      expect(Array.isArray(requestBody.included_segments)).toBe(true);
      expect(requestBody.included_segments).toContain('Test Users');
    });

    it('should have correct authorization header format', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({id: 'notification-id'}),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await sendProductNotification('product-123', 'Test Product', 29.99);

      const headers = mockFetch.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect(headers.Authorization).toMatch(/^os_v2_app_/);
      expect(headers['content-type']).toBe('application/json');
      expect(headers.accept).toBe('application/json');
    });
  });
});
