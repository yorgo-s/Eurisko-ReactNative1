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

// Hook for getting a product by ID
export const useProductDetails = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductById(productId),
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
  });
};
