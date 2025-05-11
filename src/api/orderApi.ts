/**
 * Order API
 * 
 * This file provides API functions for order-related operations.
 */

import { Order, OrderFilters, OrderItem } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get all orders
 * @param {OrderFilters} filters - Optional filters
 * @returns {Promise<Order[]>} Array of orders
 */
export const getOrders = async (filters: OrderFilters = {}): Promise<Order[]> => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch orders' }));
    throw new Error(errorData.error?.message || 'Failed to fetch orders');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Order>} Order
 */
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch order with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to fetch order with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Create a new order
 * @param {Partial<Order>} orderData - Order data
 * @returns {Promise<Order>} Created order
 */
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
    throw new Error(errorData.error?.message || 'Failed to create order');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Update an order
 * @param {string} id - Order ID
 * @param {Partial<Order>} orderData - Order data
 * @returns {Promise<Order>} Updated order
 */
export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update order with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to update order with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Delete an order
 * @param {string} id - Order ID
 * @returns {Promise<Order>} Deleted order
 */
export const deleteOrder = async (id: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to delete order with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to delete order with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Order>} Updated order
 */
export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update status for order ${id}` }));
    throw new Error(errorData.error?.message || `Failed to update status for order ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get order items
 * @param {string} orderId - Order ID
 * @returns {Promise<OrderItem[]>} Array of order items
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch items for order ${orderId}` }));
    throw new Error(errorData.error?.message || `Failed to fetch items for order ${orderId}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Add item to order
 * @param {string} orderId - Order ID
 * @param {Partial<OrderItem>} itemData - Item data
 * @returns {Promise<OrderItem>} Added item
 */
export const addOrderItem = async (orderId: string, itemData: Partial<OrderItem>): Promise<OrderItem> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to add item to order ${orderId}` }));
    throw new Error(errorData.error?.message || `Failed to add item to order ${orderId}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Remove item from order
 * @param {string} orderId - Order ID
 * @param {string} itemId - Item ID
 * @returns {Promise<OrderItem>} Removed item
 */
export const removeOrderItem = async (orderId: string, itemId: string): Promise<OrderItem> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to remove item ${itemId} from order ${orderId}` }));
    throw new Error(errorData.error?.message || `Failed to remove item ${itemId} from order ${orderId}`);
  }
  
  const result = await response.json();
  return result.data;
};
