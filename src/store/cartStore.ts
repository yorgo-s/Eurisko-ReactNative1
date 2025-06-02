import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Product} from '../api/products';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,

      addToCart: (product: Product, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          item => item.product._id === product._id,
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Product already exists, increment quantity
          newItems = currentItems.map((item, index) =>
            index === existingItemIndex
              ? {...item, quantity: item.quantity + quantity}
              : item,
          );
        } else {
          // Add new product to cart
          const newCartItem: CartItem = {
            id: `${product._id}_${Date.now()}`,
            product,
            quantity,
            addedAt: new Date(),
          };
          newItems = [...currentItems, newCartItem];
        }

        // Calculate totals
        const totalItems = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );

        set({
          items: newItems,
          totalItems,
          totalPrice,
        });
      },

      removeFromCart: (productId: string) => {
        const currentItems = get().items;
        const newItems = currentItems.filter(
          item => item.product._id !== productId,
        );

        // Calculate totals
        const totalItems = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );

        set({
          items: newItems,
          totalItems,
          totalPrice,
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map(item =>
          item.product._id === productId ? {...item, quantity} : item,
        );

        // Calculate totals
        const totalItems = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );

        set({
          items: newItems,
          totalItems,
          totalPrice,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      getCartItem: (productId: string) => {
        return get().items.find(item => item.product._id === productId);
      },

      isInCart: (productId: string) => {
        return get().items.some(item => item.product._id === productId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    },
  ),
);
