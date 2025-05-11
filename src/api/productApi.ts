/**
 * Product API
 * 
 * This file provides API functions for product-related operations.
 */

import { Product, ProductFilters } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get all products
 * @param {ProductFilters} filters - Optional filters
 * @returns {Promise<Product[]>} Array of products
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
    throw new Error(errorData.error?.message || 'Failed to fetch products');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Product>} Product
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch product with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to fetch product with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Create a new product
 * @param {Partial<Product>} productData - Product data
 * @returns {Promise<Product>} Created product
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create product' }));
    throw new Error(errorData.error?.message || 'Failed to create product');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Update a product
 * @param {string} id - Product ID
 * @param {Partial<Product>} productData - Product data
 * @returns {Promise<Product>} Updated product
 */
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update product with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to update product with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<Product>} Deleted product
 */
export const deleteProduct = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to delete product with ID ${id}` }));
    throw new Error(errorData.error?.message || `Failed to delete product with ID ${id}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get product by barcode
 * @param {string} barcode - Product barcode
 * @returns {Promise<Product>} Product
 */
export const getProductByBarcode = async (barcode: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch product with barcode ${barcode}` }));
    throw new Error(errorData.error?.message || `Failed to fetch product with barcode ${barcode}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Product[]>} Array of products
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch products in category ${categoryId}` }));
    throw new Error(errorData.error?.message || `Failed to fetch products in category ${categoryId}`);
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Product[]>} Array of matching products
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to search products' }));
    throw new Error(errorData.error?.message || 'Failed to search products');
  }
  
  const result = await response.json();
  return result.data;
};
