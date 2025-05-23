import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  productsApi,
  Product,
  ProductsQueryParams,
  ProductFormData,
} from '../api/products';
import {useState} from 'react';

// Hook for fetching products with optional filters
export const useProducts = (initialParams: ProductsQueryParams = {}) => {
  const [queryParams, setQueryParams] =
    useState<ProductsQueryParams>(initialParams);

  const {data, isLoading, error, refetch, isPreviousData} = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.getProducts(queryParams),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update query parameters
  const updateParams = (newParams: Partial<ProductsQueryParams>) => {
    setQueryParams(prev => ({...prev, ...newParams}));
  };

  // Handle pagination
  const nextPage = () => {
    if (data?.pagination?.hasNextPage) {
      updateParams({page: (queryParams.page || 1) + 1});
    }
  };

  const prevPage = () => {
    if (data?.pagination?.hasPrevPage && (queryParams.page || 1) > 1) {
      updateParams({page: (queryParams.page || 1) - 1});
    }
  };

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    isPreviousData,
    updateParams,
    nextPage,
    prevPage,
    queryParams,
  };
};

// Hook for searching products
export const useSearchProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['productSearch', searchQuery],
    queryFn: () => productsApi.searchProducts(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Function to perform the search
  const search = (query: string) => {
    setSearchQuery(query);
  };

  return {
    searchResults: data?.data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    search,
    refetch,
    searchQuery,
  };
};

// FIXED: Hook for getting a product by ID with better error handling and options support
export const useProductDetails = (
  productId: string,
  options?: {enabled?: boolean; retry?: number},
) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      try {
        console.log('Fetching product details for ID:', productId);
        const response = await productsApi.getProductById(productId);

        // Check if the response has the expected structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }

        // Handle different response structures
        if (response.success === false) {
          throw new Error(response.message || 'Failed to fetch product');
        }

        console.log('Product details response:', response);
        return response;
      } catch (error: any) {
        console.error('Product fetch error:', error);

        // Re-throw with more specific error message
        if (error.response?.status === 404) {
          throw new Error('Product not found');
        } else if (error.response?.status === 401) {
          throw new Error('Authentication required');
        } else if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error(error.message || 'Failed to fetch product details');
        }
      }
    },
    enabled: options?.enabled !== false && !!productId && productId.length > 0,
    retry: (failureCount, error) => {
      // Don't retry for 404 errors
      if (error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < (options?.retry || 2);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hooks for product mutations (Create, Update, Delete)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => productsApi.createProduct(data),
    onSuccess: () => {
      // Invalidate products queries to refetch after mutation
      queryClient.invalidateQueries({queryKey: ['products']});
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ProductFormData}) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate product and products queries
      queryClient.invalidateQueries({queryKey: ['product', variables.id]});
      queryClient.invalidateQueries({queryKey: ['products']});
    },
    onError: (error: any) => {
      console.error('Update product error:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      // Invalidate products queries
      queryClient.invalidateQueries({queryKey: ['products']});
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
    },
  });
};
