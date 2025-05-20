import {create} from 'zustand';
import {
  productsApi,
  Product,
  ProductsQueryParams,
  ProductFormData,
} from '../api/products';

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
    limit: number;
  };

  // Actions
  fetchProducts: (params?: ProductsQueryParams) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<boolean>;
  updateProduct: (id: string, data: ProductFormData) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  clearProductData: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductsState>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalItems: 0,
    limit: 10,
  },

  fetchProducts: async (params = {}) => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.getProducts(params);

      if (response.success) {
        set({
          products: response.data,
          pagination: response.pagination || get().pagination,
          isLoading: false,
        });
      } else {
        set({isLoading: false, error: 'Failed to fetch products'});
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.error?.message || 'Failed to fetch products',
      });
    }
  },

  searchProducts: async query => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.searchProducts(query);

      if (response.success) {
        set({products: response.data, isLoading: false});
      } else {
        set({isLoading: false, error: 'Search failed'});
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error?.message || 'Search failed',
      });
    }
  },

  fetchProductById: async id => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.getProductById(id);

      if (response.success) {
        set({currentProduct: response.data, isLoading: false});
      } else {
        set({isLoading: false, error: 'Failed to fetch product details'});
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.error?.message ||
          'Failed to fetch product details',
      });
    }
  },

  createProduct: async data => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.createProduct(data);

      if (response.success) {
        // Refresh product list after creation
        await get().fetchProducts();
        set({isLoading: false});
        return true;
      } else {
        set({isLoading: false, error: 'Failed to create product'});
        return false;
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.error?.message || 'Failed to create product',
      });
      return false;
    }
  },

  updateProduct: async (id, data) => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.updateProduct(id, data);

      if (response.success) {
        // Refresh product list and current product after update
        await get().fetchProducts();
        if (get().currentProduct?._id === id) {
          await get().fetchProductById(id);
        }
        set({isLoading: false});
        return true;
      } else {
        set({isLoading: false, error: 'Failed to update product'});
        return false;
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.error?.message || 'Failed to update product',
      });
      return false;
    }
  },

  deleteProduct: async id => {
    try {
      set({isLoading: true, error: null});
      const response = await productsApi.deleteProduct(id);

      if (response.success) {
        // Remove product from local state
        set({
          products: get().products.filter(product => product._id !== id),
          isLoading: false,
        });
        return true;
      } else {
        set({isLoading: false, error: 'Failed to delete product'});
        return false;
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.error?.message || 'Failed to delete product',
      });
      return false;
    }
  },

  clearProductData: () => set({currentProduct: null}),

  clearError: () => set({error: null}),
}));
