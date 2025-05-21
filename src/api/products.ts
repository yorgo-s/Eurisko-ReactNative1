import apiClient from './apiClient';

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

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  location: string; // JSON string or object
  images?: any[]; // For FormData
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const productsApi = {
  // Get all products
  getProducts: async (params: ProductsQueryParams = {}) => {
    const response = await apiClient.get('/api/products', {params});
    return response.data;
  },

  // Search products
  searchProducts: async (query: string) => {
    try {
      // Make sure query is encoded properly
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await apiClient.get(
        `/api/products/search?query=${encodedQuery}`,
      );

      // If the response has no data, return an empty array
      if (!response.data.success || !response.data.data) {
        return {success: true, data: []};
      }

      // If searching for a number, also try to match by price
      if (!isNaN(Number(query))) {
        const priceQuery = Number(query);
        // Let the API search handle the exact matches
        // If we want to also search for products around that price, we could
        // add additional filtering here
      }

      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (data: ProductFormData) => {
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
          type: image.type,
          name: image.fileName || `image${index}.jpg`,
        });
      });
    }

    const response = await apiClient.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: ProductFormData) => {
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
          type: image.type,
          name: image.fileName || `image${index}.jpg`,
        });
      });
    }

    const response = await apiClient.put(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },
};
