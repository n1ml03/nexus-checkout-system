/**
 * Product Query Hooks
 * 
 * This file provides React Query hooks for product-related operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productApi from '@/api/productApi';
import { Product, ProductFilters } from '@/types';
import { toast } from 'sonner';

/**
 * Query keys for products
 */
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
  barcode: (code: string) => [...productQueryKeys.all, 'barcode', code] as const,
  category: (categoryId: string) => [...productQueryKeys.all, 'category', categoryId] as const,
  search: (query: string) => [...productQueryKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all products
 * @param {ProductFilters} filters - Optional filters
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useProducts = (filters: ProductFilters = {}, options = {}) => {
  return useQuery<Product[], Error>({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a single product by ID
 * @param {string} id - Product ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useProduct = (id: string, options = {}) => {
  return useQuery<Product, Error>({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a product by barcode
 * @param {string} barcode - Product barcode
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useProductByBarcode = (barcode: string, options = {}) => {
  return useQuery<Product, Error>({
    queryKey: productQueryKeys.barcode(barcode),
    queryFn: () => productApi.getProductByBarcode(barcode),
    enabled: !!barcode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch products by category
 * @param {string} categoryId - Category ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useProductsByCategory = (categoryId: string, options = {}) => {
  return useQuery<Product[], Error>({
    queryKey: productQueryKeys.category(categoryId),
    queryFn: () => productApi.getProductsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to search products
 * @param {string} query - Search query
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useSearchProducts = (query: string, options = {}) => {
  return useQuery<Product[], Error>({
    queryKey: productQueryKeys.search(query),
    queryFn: () => productApi.searchProducts(query),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create a product
 * @returns {Object} React Query mutation result
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: productApi.createProduct,
    onSuccess: (newProduct) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Product "${newProduct.name}" created successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
};

/**
 * Hook to update a product
 * @returns {Object} React Query mutation result
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, { id: string; data: Partial<Product> }>({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate products list and the specific product
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(updatedProduct.id) });
      
      // Show success toast
      toast.success(`Product "${updatedProduct.name}" updated successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a product
 * @returns {Object} React Query mutation result
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, string>({
    mutationFn: productApi.deleteProduct,
    onSuccess: (deletedProduct) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      
      // Show success toast
      toast.success(`Product "${deletedProduct.name}" deleted successfully`);
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
};
