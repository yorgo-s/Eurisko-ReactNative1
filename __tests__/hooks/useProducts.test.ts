
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useSearchProducts, useProductDetails } from '../../src/hooks/useProducts';
import { productsApi } from '../../src/api/products';

// Mock the products API
jest.mock('../../src/api/products');
const mockProductsApi = productsApi as jest.Mocked<typeof productsApi>;

// Mock data
const mockProducts = [
  {
    _id: '1',
    title: 'Test Product 1',
    description: 'Test description 1',
    price: 29.99,
    images: [{ url: '/image1.jpg', _id: 'img1' }],
    location: { name: 'Test Location 1', longitude: 35.5018, latitude: 33.8938 },
    user: { _id: 'user1', email: 'user1@test.com' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    title: 'Test Product 2',
    description: 'Test description 2',
    price: 49.99,
    images: [{ url: '/image2.jpg', _id: 'img2' }],
    location: { name: 'Test Location 2', longitude: 35.5018, latitude: 33.8938 },
    user: { _id: 'user2', email: 'user2@test.com' },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 2,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.pagination).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch products error', async () => {
    const errorMessage = 'Failed to fetch products';
    mockProductsApi.getProducts.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should update query parameters', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 2,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
        totalItems: 25,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update parameters
    result.current.updateParams({ page: 2, sortBy: 'price', order: 'asc' });

    await waitFor(() => {
      expect(mockProductsApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          sortBy: 'price',
          order: 'asc',
        }),
      );
    });
  });

  it('should handle pagination correctly', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 1,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
        totalItems: 25,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test next page
    result.current.nextPage();

    await waitFor(() => {
      expect(mockProductsApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      );
    });
  });

  it('should handle previous page', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 2,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
        totalItems: 25,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts({ page: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test previous page
    result.current.prevPage();

    await waitFor(() => {
      expect(mockProductsApi.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });
  });

  it('should not go to previous page when on first page', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 1,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
        totalItems: 25,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = mockProductsApi.getProducts.mock.calls.length;
    
    // Try to go to previous page (should not work)
    result.current.prevPage();

    // Should not make additional API call
    expect(mockProductsApi.getProducts).toHaveBeenCalledTimes(initialCallCount);
  });

  it('should not go to next page when no next page available', async () => {
    mockProductsApi.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        currentPage: 3,
        totalPages: 3,
        hasNextPage: false,
        hasPrevPage: true,
        totalItems: 25,
        limit: 10,
      },
    });

    const { result } = renderHook(() => useProducts({ page: 3 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = mockProductsApi.getProducts.mock.calls.length;
    
    // Try to go to next page (should not work)
    result.current.nextPage();

    // Should not make additional API call
    expect(mockProductsApi.getProducts).toHaveBeenCalledTimes(initialCallCount);
  });
});

describe('useSearchProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search products successfully', async () => {
    const searchQuery = 'test product';
    mockProductsApi.searchProducts.mockResolvedValue({
      success: true,
      data: [mockProducts[0]],
    });

    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    // Trigger search
    result.current.search(searchQuery);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockProductsApi.searchProducts).toHaveBeenCalledWith(searchQuery);
    expect(result.current.searchResults).toEqual([mockProducts[0]]);
    expect(result.current.searchQuery).toBe(searchQuery);
  });

  it('should handle empty search results', async () => {
    mockProductsApi.searchProducts.mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    result.current.search('nonexistent product');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('should handle search errors', async () => {
    const errorMessage = 'Search failed';
    mockProductsApi.searchProducts.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    result.current.search('test');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.searchResults).toEqual([]);
  });

  it('should not search when query is empty', () => {
    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    result.current.search('');

    expect(mockProductsApi.searchProducts).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle special characters in search query', async () => {
    const specialQuery = 'test "product" & more!';
    mockProductsApi.searchProducts.mockResolvedValue({
      success: true,
      data: [mockProducts[0]],
    });

    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    result.current.search(specialQuery);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockProductsApi.searchProducts).toHaveBeenCalledWith(specialQuery);
  });

  it('should refetch search results', async () => {
    mockProductsApi.searchProducts.mockResolvedValue({
      success: true,
      data: [mockProducts[0]],
    });

    const { result } = renderHook(() => useSearchProducts(), {
      wrapper: createWrapper(),
    });

    result.current.search('test');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refetch
    result.current.refetch();

    await waitFor(() => {
      expect(mockProductsApi.searchProducts).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch product details successfully', async () => {
    const productId = '1';
    mockProductsApi.getProductById.mockResolvedValue({
      success: true,
      data: mockProducts[0],
    });

    const { result } = renderHook(() => useProductDetails(productId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockProductsApi.getProductById).toHaveBeenCalledWith(productId);
    expect(result.current.data).toEqual({
      success: true,
      data: mockProducts[0],
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle product not found', async () => {
    const productId = 'nonexistent';
    const error = new Error('Product not found');
    mockProductsApi.getProductById.mockRejectedValue(error);

    const { result } = renderHook(() => useProductDetails(productId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Product not found');
  });

  it('should not fetch when product ID is empty', () => {
    const { result } = renderHook(() => useProductDetails(''), {
      wrapper: createWrapper(),
    });

    expect(mockProductsApi.getProductById).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle authentication errors', async () => {
    const productId = '1';
    const authError = new Error('Authentication required');
    (authError as any).response = { status: 401 };
    mockProductsApi.getProductById.mockRejecte