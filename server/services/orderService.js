/**
 * Order Service
 * 
 * This file provides service methods for order-related operations.
 * It encapsulates business logic and database interactions.
 */

import { Pool } from 'pg';

/**
 * Create order service with the provided database pool
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Object} Order service methods
 */
export const createOrderService = (pool) => {
  /**
   * Get all orders
   * @returns {Promise<Array>} Array of orders
   */
  const getAllOrders = async () => {
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  };

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order object
   */
  const getOrderById = async (orderId) => {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      
      if (result.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in getOrderById for ID ${orderId}:`, error);
      throw error;
    }
  };

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  const createOrder = async (orderData) => {
    // Start a transaction to ensure all operations succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { customer_id, total_amount, status, payment_method, payment_status, notes, items } = orderData;
      
      // Insert the order
      const orderResult = await client.query(
        `INSERT INTO orders 
         (customer_id, total_amount, status, payment_method, payment_status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [customer_id, total_amount, status, payment_method, payment_status, notes]
      );
      
      const order = orderResult.rows[0];
      
      // Insert order items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO order_items 
             (order_id, product_id, quantity, unit_price) 
             VALUES ($1, $2, $3, $4)`,
            [order.id, item.product_id, item.quantity, item.unit_price]
          );
        }
      }
      
      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createOrder:', error);
      throw error;
    } finally {
      client.release();
    }
  };

  /**
   * Update an order
   * @param {string} orderId - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  const updateOrder = async (orderId, orderData) => {
    try {
      // First check if order exists
      const checkResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      
      if (checkResult.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      // Build the update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(orderData)) {
        if (value !== undefined && key !== 'id' && key !== 'items') {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      if (updates.length === 0) {
        return checkResult.rows[0]; // No updates needed
      }
      
      values.push(orderId); // Add orderId as the last parameter
      
      const updateQuery = `
        UPDATE orders 
        SET ${updates.join(', ')}, updated_at = NOW() 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateOrder for ID ${orderId}:`, error);
      throw error;
    }
  };

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  const updateOrderStatus = async (orderId, status) => {
    try {
      const result = await pool.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, orderId]
      );
      
      if (result.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateOrderStatus for ID ${orderId}:`, error);
      throw error;
    }
  };

  /**
   * Delete an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Deleted order
   */
  const deleteOrder = async (orderId) => {
    // Start a transaction to ensure all operations succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First delete order items
      await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
      
      // Then delete the order
      const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
      
      if (result.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error in deleteOrder for ID ${orderId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  };

  /**
   * Get order items
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Array of order items
   */
  const getOrderItems = async (orderId) => {
    try {
      // First check if order exists
      const orderCheck = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      
      if (orderCheck.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      const result = await pool.query(
        `SELECT oi.*, p.name as product_name, p.sku, p.barcode 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = $1`,
        [orderId]
      );
      
      return result.rows;
    } catch (error) {
      console.error(`Error in getOrderItems for order ID ${orderId}:`, error);
      throw error;
    }
  };

  /**
   * Add item to order
   * @param {string} orderId - Order ID
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Added item
   */
  const addOrderItem = async (orderId, itemData) => {
    try {
      // First check if order exists
      const orderCheck = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      
      if (orderCheck.rows.length === 0) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        throw error;
      }
      
      const { product_id, quantity, unit_price } = itemData;
      
      const result = await pool.query(
        `INSERT INTO order_items 
         (order_id, product_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [orderId, product_id, quantity, unit_price]
      );
      
      // Update order total
      await pool.query(
        'UPDATE orders SET total_amount = total_amount + $1, updated_at = NOW() WHERE id = $2',
        [quantity * unit_price, orderId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in addOrderItem for order ID ${orderId}:`, error);
      throw error;
    }
  };

  /**
   * Remove item from order
   * @param {string} orderId - Order ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} Removed item
   */
  const removeOrderItem = async (orderId, itemId) => {
    try {
      // First get the item to calculate the price reduction
      const itemCheck = await pool.query(
        'SELECT * FROM order_items WHERE id = $1 AND order_id = $2',
        [itemId, orderId]
      );
      
      if (itemCheck.rows.length === 0) {
        const error = new Error(`Item with ID ${itemId} not found in order ${orderId}`);
        error.statusCode = 404;
        throw error;
      }
      
      const item = itemCheck.rows[0];
      const priceReduction = item.quantity * item.unit_price;
      
      // Delete the item
      const result = await pool.query(
        'DELETE FROM order_items WHERE id = $1 AND order_id = $2 RETURNING *',
        [itemId, orderId]
      );
      
      // Update order total
      await pool.query(
        'UPDATE orders SET total_amount = total_amount - $1, updated_at = NOW() WHERE id = $2',
        [priceReduction, orderId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in removeOrderItem for order ID ${orderId}, item ID ${itemId}:`, error);
      throw error;
    }
  };

  return {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderItems,
    addOrderItem,
    removeOrderItem
  };
};

export default createOrderService;
