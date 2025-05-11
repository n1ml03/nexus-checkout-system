/**
 * Analytics Query Hooks
 * 
 * This file provides React Query hooks for analytics-related operations.
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '@/api/analyticsApi';
import { AnalyticsOptions } from '@/types';

/**
 * Query keys for analytics
 */
export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  sales: (options: AnalyticsOptions) => [...analyticsQueryKeys.all, 'sales', options] as const,
  revenue: (options: AnalyticsOptions) => [...analyticsQueryKeys.all, 'revenue', options] as const,
  products: (options: AnalyticsOptions) => [...analyticsQueryKeys.all, 'products', options] as const,
  customers: (options: AnalyticsOptions) => [...analyticsQueryKeys.all, 'customers', options] as const,
  dashboard: () => [...analyticsQueryKeys.all, 'dashboard'] as const,
};

/**
 * Hook to fetch sales data
 * @param {AnalyticsOptions} options - Analytics options
 * @param {Object} queryOptions - Additional React Query options
 * @returns {Object} React Query result
 */
export const useSalesData = (options: AnalyticsOptions = {}, queryOptions = {}) => {
  return useQuery<any[], Error>({
    queryKey: analyticsQueryKeys.sales(options),
    queryFn: () => analyticsApi.getSalesData(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
};

/**
 * Hook to fetch revenue data
 * @param {AnalyticsOptions} options - Analytics options
 * @param {Object} queryOptions - Additional React Query options
 * @returns {Object} React Query result
 */
export const useRevenueData = (options: AnalyticsOptions = {}, queryOptions = {}) => {
  return useQuery<any[], Error>({
    queryKey: analyticsQueryKeys.revenue(options),
    queryFn: () => analyticsApi.getRevenueData(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
};

/**
 * Hook to fetch product performance data
 * @param {AnalyticsOptions} options - Analytics options
 * @param {Object} queryOptions - Additional React Query options
 * @returns {Object} React Query result
 */
export const useProductPerformance = (options: AnalyticsOptions = {}, queryOptions = {}) => {
  return useQuery<any[], Error>({
    queryKey: analyticsQueryKeys.products(options),
    queryFn: () => analyticsApi.getProductPerformance(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
};

/**
 * Hook to fetch customer insights data
 * @param {AnalyticsOptions} options - Analytics options
 * @param {Object} queryOptions - Additional React Query options
 * @returns {Object} React Query result
 */
export const useCustomerInsights = (options: AnalyticsOptions = {}, queryOptions = {}) => {
  return useQuery<any[], Error>({
    queryKey: analyticsQueryKeys.customers(options),
    queryFn: () => analyticsApi.getCustomerInsights(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
};

/**
 * Hook to fetch dashboard summary data
 * @param {Object} queryOptions - Additional React Query options
 * @returns {Object} React Query result
 */
export const useDashboardSummary = (queryOptions = {}) => {
  return useQuery<any, Error>({
    queryKey: analyticsQueryKeys.dashboard(),
    queryFn: analyticsApi.getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
};
