/**
 * Analytics API
 *
 * This file provides API functions for analytics-related operations.
 */

import { AnalyticsOptions } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get sales data
 * @param {AnalyticsOptions} options - Analytics options
 * @returns {Promise<any[]>} Sales data
 */
export const getSalesData = async (options: AnalyticsOptions = {}): Promise<any[]> => {
  const queryParams = new URLSearchParams();

  // Add options to query params
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/analytics/sales${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch sales data' }));
    throw new Error(errorData.error?.message || 'Failed to fetch sales data');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get revenue data
 * @param {AnalyticsOptions} options - Analytics options
 * @returns {Promise<any[]>} Revenue data
 */
export const getRevenueData = async (options: AnalyticsOptions = {}): Promise<any[]> => {
  const queryParams = new URLSearchParams();

  // Add options to query params
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/analytics/revenue${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch revenue data' }));
    throw new Error(errorData.error?.message || 'Failed to fetch revenue data');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get product performance data
 * @param {AnalyticsOptions} options - Analytics options
 * @returns {Promise<any[]>} Product performance data
 */
export const getProductPerformance = async (options: AnalyticsOptions = {}): Promise<any[]> => {
  const queryParams = new URLSearchParams();

  // Add options to query params
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/analytics/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch product performance data' }));
    throw new Error(errorData.error?.message || 'Failed to fetch product performance data');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get customer insights data
 * @param {AnalyticsOptions} options - Analytics options
 * @returns {Promise<any[]>} Customer insights data
 */
export const getCustomerInsights = async (options: AnalyticsOptions = {}): Promise<any[]> => {
  const queryParams = new URLSearchParams();

  // Add options to query params
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/analytics/customers${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customer insights data' }));
    throw new Error(errorData.error?.message || 'Failed to fetch customer insights data');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get dashboard summary data
 * @returns {Promise<any>} Dashboard summary data
 */
export const getDashboardSummary = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard summary data' }));
    throw new Error(errorData.error?.message || 'Failed to fetch dashboard summary data');
  }

  const result = await response.json();
  const serverData = result.data;

  // Transform server data to match the expected AnalyticsData format
  return {
    // Map server properties to client properties
    totalSales: serverData.total_sales || 0,
    salesGrowth: serverData.sales_growth || 0,
    activeCustomers: serverData.total_customers || 0,
    customerGrowth: serverData.customer_growth || 0,
    conversionRate: serverData.conversion_rate || 0,
    conversionGrowth: serverData.conversion_growth || 0,
    avgOrderValue: serverData.avg_order_value || (serverData.total_sales && serverData.total_orders ?
      serverData.total_sales / serverData.total_orders : 0),

    // Default empty arrays for chart data if not provided
    salesData: serverData.sales_data || [],
    categoryData: serverData.category_data || [],
    revenueData: serverData.revenue_data || [],
    topProducts: serverData.top_products || []
  };
};
