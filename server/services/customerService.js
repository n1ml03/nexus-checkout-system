/**
 * Customer Service
 * 
 * This file provides service methods for customer-related operations.
 * It encapsulates business logic and database interactions.
 */

import { Pool } from 'pg';

/**
 * Create customer service with the provided database pool
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Object} Customer service methods
 */
export const createCustomerService = (pool) => {
  /**
   * Get all customers
   * @returns {Promise<Array>} Array of customers
   */
  const getAllCustomers = async () => {
    try {
      const result = await pool.query('SELECT * FROM customers ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  };

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer object
   */
  const getCustomerById = async (customerId) => {
    try {
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      
      if (result.rows.length === 0) {
        const error = new Error(`Customer with ID ${customerId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in getCustomerById for ID ${customerId}:`, error);
      throw error;
    }
  };

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  const createCustomer = async (customerData) => {
    try {
      const { name, email, phone, address, notes } = customerData;
      
      const result = await pool.query(
        `INSERT INTO customers 
         (name, email, phone, address, notes) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [name, email, phone, address, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in createCustomer:', error);
      throw error;
    }
  };

  /**
   * Update a customer
   * @param {string} customerId - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  const updateCustomer = async (customerId, customerData) => {
    try {
      // First check if customer exists
      const checkResult = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      
      if (checkResult.rows.length === 0) {
        const error = new Error(`Customer with ID ${customerId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      // Build the update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(customerData)) {
        if (value !== undefined && key !== 'id') {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      if (updates.length === 0) {
        return checkResult.rows[0]; // No updates needed
      }
      
      values.push(customerId); // Add customerId as the last parameter
      
      const updateQuery = `
        UPDATE customers 
        SET ${updates.join(', ')}, updated_at = NOW() 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateCustomer for ID ${customerId}:`, error);
      throw error;
    }
  };

  /**
   * Delete a customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Deleted customer
   */
  const deleteCustomer = async (customerId) => {
    try {
      const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [customerId]);
      
      if (result.rows.length === 0) {
        const error = new Error(`Customer with ID ${customerId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in deleteCustomer for ID ${customerId}:`, error);
      throw error;
    }
  };

  /**
   * Search customers
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching customers
   */
  const searchCustomers = async (query) => {
    try {
      const searchPattern = `%${query}%`;
      const result = await pool.query(
        `SELECT * FROM customers 
         WHERE name ILIKE $1 
         OR email ILIKE $1 
         OR phone ILIKE $1 
         ORDER BY name`,
        [searchPattern]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error in searchCustomers for query ${query}:`, error);
      throw error;
    }
  };

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Array of customer orders
   */
  const getCustomerOrders = async (customerId) => {
    try {
      // First check if customer exists
      const customerCheck = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      
      if (customerCheck.rows.length === 0) {
        const error = new Error(`Customer with ID ${customerId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      const result = await pool.query(
        'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
        [customerId]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error in getCustomerOrders for customer ID ${customerId}:`, error);
      throw error;
    }
  };

  return {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerOrders
  };
};

export default createCustomerService;
