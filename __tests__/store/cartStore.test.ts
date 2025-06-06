import {act, renderHook} from '@testing-library/react-native';
import {useCartStore} from '../../src/store/cartStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const mockProduct = {
  _id: '1',
  title: 'Test Product',
  description: 'Test description',
  price: 29.99,
  images: [{url: '/image.jpg', _id: 'img1'}],
  location: {name: 'Test Location', longitude: 35.5018, latitude: 33.8938},
  user: {_id: 'user1', email: 'user@test.com'},
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockProduct2 = {
  ...mockProduct,
  _id: '2',
  title: 'Test Product 2',
  price: 49.99,
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useCartStore.setState({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add new product to cart', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        product: mockProduct,
        quantity: 2,
      });
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBe(59.98);
    });

    it('should increment quantity for existing product', () => {
      const {result} = renderHook(() => useCartStore());

      // Add product first time
      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      // Add same product again
      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
      expect(result.current.totalPrice).toBe(89.97);
    });

    it('should add multiple different products', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBe(79.98);
    });

    it('should use default quantity of 1', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.totalItems).toBe(1);
    });

    it('should generate unique cart item IDs', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.items[0].id).toBeDefined();
      expect(result.current.items[1].id).toBeDefined();
      expect(result.current.items[0].id).not.toBe(result.current.items[1].id);
    });

    it('should set addedAt timestamp', () => {
      const {result} = renderHook(() => useCartStore());
      const beforeTime = new Date().getTime();

      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      const afterTime = new Date().getTime();
      const addedAt = new Date(result.current.items[0].addedAt).getTime();

      expect(addedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(addedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const {result} = renderHook(() => useCartStore());

      // Add products first
      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart(mockProduct2, 1);
      });

      // Remove one product
      act(() => {
        result.current.removeFromCart(mockProduct._id);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product._id).toBe(mockProduct2._id);
      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPrice).toBe(49.99);
    });

    it('should handle removing non-existent product', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      act(() => {
        result.current.removeFromCart('non-existent-id');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.totalItems).toBe(1);
    });

    it('should recalculate totals correctly after removal', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 3);
        result.current.addToCart(mockProduct2, 2);
      });

      expect(result.current.totalPrice).toBe(189.95); // (29.99 * 3) + (49.99 * 2)

      act(() => {
        result.current.removeFromCart(mockProduct._id);
      });

      expect(result.current.totalPrice).toBe(99.98); // 49.99 * 2
      expect(result.current.totalItems).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update product quantity', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity(mockProduct._id, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalPrice).toBe(149.95);
    });

    it('should remove product when quantity is set to 0', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity(mockProduct._id, 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should remove product when quantity is negative', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity(mockProduct._id, -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should handle updating non-existent product', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      act(() => {
        result.current.updateQuantity('non-existent-id', 5);
      });

      // Should not affect existing items
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart(mockProduct2, 1);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should handle clearing empty cart', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('getCartItem', () => {
    it('should return cart item by product ID', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      const cartItem = result.current.getCartItem(mockProduct._id);

      expect(cartItem).toBeDefined();
      expect(cartItem?.product._id).toBe(mockProduct._id);
      expect(cartItem?.quantity).toBe(2);
    });

    it('should return undefined for non-existent product', () => {
      const {result} = renderHook(() => useCartStore());

      const cartItem = result.current.getCartItem('non-existent-id');

      expect(cartItem).toBeUndefined();
    });
  });

  describe('isInCart', () => {
    it('should return true for product in cart', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      expect(result.current.isInCart(mockProduct._id)).toBe(true);
    });

    it('should return false for product not in cart', () => {
      const {result} = renderHook(() => useCartStore());

      expect(result.current.isInCart('non-existent-id')).toBe(false);
    });
  });

  describe('getCartSummary', () => {
    it('should return correct cart summary', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart(mockProduct2, 1);
      });

      const summary = result.current.getCartSummary();

      expect(summary).toEqual({
        itemCount: 2,
        totalQuantity: 3,
        totalPrice: 109.97,
        averageItemPrice: 39.99,
      });
    });

    it('should handle empty cart', () => {
      const {result} = renderHook(() => useCartStore());

      const summary = result.current.getCartSummary();

      expect(summary).toEqual({
        itemCount: 0,
        totalQuantity: 0,
        totalPrice: 0,
        averageItemPrice: 0,
      });
    });

    it('should calculate average price correctly', () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 1); // $29.99
        result.current.addToCart(mockProduct2, 1); // $49.99
      });

      const summary = result.current.getCartSummary();
      expect(summary.averageItemPrice).toBe(39.99); // (29.99 + 49.99) / 2
    });
  });

  describe('getRecentItems', () => {
    it('should return recent items sorted by date', async () => {
      const {result} = renderHook(() => useCartStore());

      // Add items with slight delay to ensure different timestamps
      act(() => {
        result.current.addToCart(mockProduct, 1);
      });

      // Wait a bit before adding second item
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.addToCart(mockProduct2, 1);
      });

      const recentItems = result.current.getRecentItems(5);

      expect(recentItems).toHaveLength(2);
      // Most recent item should be first
      expect(recentItems[0].product._id).toBe(mockProduct2._id);
    });

    it('should limit items to specified count', () => {
      const {result} = renderHook(() => useCartStore());

      // Add 3 items
      act(() => {
        result.current.addToCart(mockProduct, 1);
        result.current.addToCart(mockProduct2, 1);
        result.current.addToCart({...mockProduct, _id: '3'}, 1);
      });

      const recentItems = result.current.getRecentItems(2);

      expect(recentItems).toHaveLength(2);
    });

    it('should use default limit of 5', () => {
      const {result} = renderHook(() => useCartStore());

      // Add 6 items
      for (let i = 1; i <= 6; i++) {
        act(() => {
          result.current.addToCart({...mockProduct, _id: i.toString()}, 1);
        });
      }

      const recentItems = result.current.getRecentItems();

      expect(recentItems).toHaveLength(5);
    });
  });

  describe('price calculations', () => {
    it('should handle decimal prices correctly', () => {
      const {result} = renderHook(() => useCartStore());

      const productWithDecimal = {
        ...mockProduct,
        price: 19.95,
      };

      act(() => {
        result.current.addToCart(productWithDecimal, 3);
      });

      expect(result.current.totalPrice).toBe(59.85);
    });

    it('should handle zero price products', () => {
      const {result} = renderHook(() => useCartStore());

      const freeProduct = {
        ...mockProduct,
        price: 0,
      };

      act(() => {
        result.current.addToCart(freeProduct, 2);
      });

      expect(result.current.totalPrice).toBe(0);
      expect(result.current.totalItems).toBe(2);
    });
  });

  describe('persistence', () => {
    it('should persist cart data to AsyncStorage', async () => {
      const {result} = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      // Zustand persist should trigger AsyncStorage.setItem
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
