// src/store/productStore.ts
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id: string;
  }>;
  location?: {
    name: string;
    longitude: number;
    latitude: number;
  };
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  location: string; // JSON string or object
  images?: any[]; // For FormData
}

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

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      // Build the query string from params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.minPrice)
        queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice)
        queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);

      const queryString = queryParams.toString();
      const url = `https://backend-practice.eurisko.me/api/products${
        queryString ? `?${queryString}` : ''
      }`;

      console.log('Fetching products from:', url);

      // Fetch products from the API
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log('Products response:', data);

      if (data.success) {
        set({
          products: data.data,
          pagination: data.pagination || get().pagination,
          isLoading: false,
        });
      } else {
        set({isLoading: false, error: 'Failed to fetch products'});
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch products',
      });
    }
  },

  searchProducts: async query => {
    try {
      set({isLoading: true, error: null});

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      console.log('Searching products with query:', query);

      // Search products from the API
      const response = await fetch(
        `https://backend-practice.eurisko.me/api/products/search?query=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search response:', data);

      if (data.success) {
        set({products: data.data, isLoading: false});
      } else {
        set({isLoading: false, error: 'Search failed'});
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      set({
        isLoading: false,
        error: error.message || 'Search failed',
      });
    }
  },

  fetchProductById: async id => {
    try {
      set({isLoading: true, error: null});

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      console.log('Fetching product details for ID:', id);

      // Fetch product by ID from the API
      const response = await fetch(
        `https://backend-practice.eurisko.me/api/products/${id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product details response:', data);

      if (data.success) {
        set({currentProduct: data.data, isLoading: false});
      } else {
        set({isLoading: false, error: 'Failed to fetch product details'});
      }
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch product details',
      });
    }
  },

  createProduct: async data => {
    try {
      set({isLoading: true, error: null});

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      console.log('Creating new product:', data);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('location', data.location);

      // Append multiple images if provided
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image${index}.jpg`,
          });
        });
      }

      // Create product using the API
      const response = await fetch(
        'https://backend-practice.eurisko.me/api/products',
        {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Create product response:', responseData);

      if (responseData.success) {
        // Refresh product list after creation
        await get().fetchProducts();
        set({isLoading: false});
        return true;
      } else {
        set({isLoading: false, error: 'Failed to create product'});
        return false;
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to create product',
      });
      return false;
    }
  },

  updateProduct: async (id, data) => {
    try {
      set({isLoading: true, error: null});

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      console.log('Updating product:', id, data);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('location', data.location);

      // Append multiple images if provided
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image${index}.jpg`,
          });
        });
      }

      // Update product using the API
      const response = await fetch(
        `https://backend-practice.eurisko.me/api/products/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Update product response:', responseData);

      if (responseData.success) {
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
      console.error('Error updating product:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to update product',
      });
      return false;
    }
  },

  deleteProduct: async id => {
    try {
      set({isLoading: true, error: null});

      // Get the authentication token
      const token = await AsyncStorage.getItem('@auth_token');

      console.log('Deleting product:', id);

      // Delete product using the API
      const response = await fetch(
        `https://backend-practice.eurisko.me/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete product response:', data);

      if (data.success) {
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
      console.error('Error deleting product:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to delete product',
      });
      return false;
    }
  },

  clearProductData: () => set({currentProduct: null}),

  clearError: () => set({error: null}),
}));
