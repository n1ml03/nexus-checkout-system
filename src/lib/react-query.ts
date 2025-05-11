/**
 * React Query Configuration and Utilities
 *
 * This file provides optimized React Query configuration and utilities
 * for data fetching with enhanced caching strategies.
 *
 * It includes:
 * - QueryClient configuration with default settings
 * - Prefetch utilities for initial data loading
 * - Re-exports of commonly used query hooks
 * - Utility functions for working with React Query
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProducts, useProduct, useProductByBarcode, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/queries/useProducts';
import { useCustomers, useCustomer, useCustomerOrders, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/queries/useCustomers';
import { useOrders, useOrder, useOrderItems, useCreateOrder, useUpdateOrder, useUpdateOrderStatus } from '@/queries/useOrders';
import { useDashboardSummary, useSalesData, useRevenueData, useProductPerformance, useCustomerInsights } from '@/queries/useAnalytics';
import { useLogin, useRegister, useLogout, useCurrentUser, useUpdateProfile } from '@/queries/useAuth';

/**
 * Default React Query options
 */
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    useErrorBoundary: false, // Don't use error boundary by default
  },
  mutations: {
    retry: 1,
    onError: (error: Error) => {
      // Global error handler for mutations
      console.error('Mutation error:', error);
      toast.error(error.message || 'An error occurred');
    },
  },
};

/**
 * Create a configured QueryClient with optimized settings
 * @param options - Optional override for default options
 * @returns A configured QueryClient
 */
export const createQueryClient = (options?: DefaultOptions) => {
  return new QueryClient({
    defaultOptions: options || defaultQueryOptions,
  });
};

/**
 * Prefetch utilities for initial data loading
 */
import { productQueryKeys } from '@/queries/useProducts';
import { customerQueryKeys } from '@/queries/useCustomers';
import { orderQueryKeys } from '@/queries/useOrders';
import { analyticsQueryKeys } from '@/queries/useAnalytics';

/**
 * Prefetch products data
 * @param queryClient - QueryClient instance
 * @param filters - Optional filters for the products query
 */
export const prefetchProducts = async (queryClient: QueryClient, filters = {}) => {
  await queryClient.prefetchQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => import('@/api/productApi').then(api => api.getProducts(filters)),
  });
};

/**
 * Prefetch customers data
 * @param queryClient - QueryClient instance
 * @param filters - Optional filters for the customers query
 */
export const prefetchCustomers = async (queryClient: QueryClient, filters = {}) => {
  await queryClient.prefetchQuery({
    queryKey: customerQueryKeys.list(filters),
    queryFn: () => import('@/api/customerApi').then(api => api.getCustomers(filters)),
  });
};

/**
 * Prefetch orders data
 * @param queryClient - QueryClient instance
 * @param filters - Optional filters for the orders query
 */
export const prefetchOrders = async (queryClient: QueryClient, filters = {}) => {
  await queryClient.prefetchQuery({
    queryKey: orderQueryKeys.list(filters),
    queryFn: () => import('@/api/orderApi').then(api => api.getOrders(filters)),
  });
};

/**
 * Prefetch dashboard summary data
 * @param queryClient - QueryClient instance
 */
export const prefetchDashboardSummary = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: analyticsQueryKeys.dashboard(),
    queryFn: () => import('@/api/analyticsApi').then(api => api.getDashboardSummary()),
  });
};

/**
 * Preload essential data on app initialization
 * @param queryClient - QueryClient instance
 * @param options - Optional configuration for preloading
 */
export const preloadEssentialData = async (
  queryClient: QueryClient,
  options = {
    includeProducts: true,
    includeCustomers: true,
    includeOrders: true,
    includeDashboard: true
  }
) => {
  try {
    const tasks = [];

    if (options.includeProducts) tasks.push(prefetchProducts(queryClient));
    if (options.includeCustomers) tasks.push(prefetchCustomers(queryClient));
    if (options.includeOrders) tasks.push(prefetchOrders(queryClient));
    if (options.includeDashboard) tasks.push(prefetchDashboardSummary(queryClient));

    await Promise.all(tasks);
    console.log('Essential data preloaded successfully');
  } catch (error) {
    console.error('Error preloading essential data:', error);
  }
};

/**
 * Utility functions for working with React Query
 */

/**
 * Reset the entire cache
 * @param queryClient - QueryClient instance
 */
export const resetQueryCache = (queryClient: QueryClient) => {
  queryClient.resetQueries();
};

/**
 * Invalidate and refetch all queries for a specific entity
 * @param queryClient - QueryClient instance
 * @param entityKey - The base key for the entity (e.g., 'products')
 */
export const invalidateEntityQueries = (queryClient: QueryClient, entityKey: string) => {
  queryClient.invalidateQueries({ queryKey: [entityKey] });
};

// Re-export the hooks for convenience
export {
  // Product hooks
  useProducts,
  useProduct,
  useProductByBarcode,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,

  // Customer hooks
  useCustomers,
  useCustomer,
  useCustomerOrders,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,

  // Order hooks
  useOrders,
  useOrder,
  useOrderItems,
  useCreateOrder,
  useUpdateOrder,
  useUpdateOrderStatus,

  // Analytics hooks
  useDashboardSummary,
  useSalesData,
  useRevenueData,
  useProductPerformance,
  useCustomerInsights,

  // Auth hooks
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  useUpdateProfile
};
