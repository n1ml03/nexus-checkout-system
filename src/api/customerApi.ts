/**
 * Customer API
 * 
 * This file provides API functions for customer-related operations.
 */

import { Customer, CustomerFilters } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get all customers
 * @param {CustomerFilters} filters - Optional filters
 * @returns {Promise<Customer[]>} Array of customers
 */
export const getCustomers = async (filters: CustomerFilters = {}): Promise<Customer[]> => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/customers${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customers' }));
    throw new Error(errorData.error?.message || 'Failed to fetch customers');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<Customer>} Customer
 */
export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch customer with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to fetch customer with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Create a new customer
 * @param {Partial<Customer>} customerData - Customer data
 * @returns {Promise<Customer>} Created customer
 */
export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create customer' }));
    throw new Error(errorData.error?.message || 'Failed to create customer');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Update a customer
 * @param {string} id - Customer ID
 * @param {Partial<Customer>} customerData - Customer data
 * @returns {Promise<Customer>} Updated customer
 */
export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update customer with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to update customer with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise<Customer>} Deleted customer
 */
export const deleteCustomer = async (id: string): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to delete customer with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to delete customer with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Search customers
 * @param {string} query - Search query
 * @returns {Promise<Customer[]>} Array of matching customers
 */
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to search customers' }));
    throw new Error(errorData.error?.message || 'Failed to search customers');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get customer orders
 * @param {string} customerId - Customer ID
 * @returns {Promise<any[]>} Array of customer orders
 */
export const getCustomerOrders = async (customerId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/customers/${customerId}/orders`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch orders for customer ${customerId}` }));
    throw new Error(errorData.error?.message || `Failed to fetch orders for customer ${customerId}`);
  }
  
  const result = await response.json();
  return result.data;
};
