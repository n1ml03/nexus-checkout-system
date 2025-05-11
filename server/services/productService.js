/**
 * Product Service
 *
 * This file provides service methods for product-related operations.
 * It encapsulates business logic and database interactions.
 */

import { Pool } from 'pg';

/**
 * Create product service with the provided database pool
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Object} Product service methods
 */
export const createProductService = (pool) => {
  /**
   * Get all products
   * @returns {Promise<Array>} Array of products
   */
  const getAllProducts = async () => {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
      `);
      return result.rows;
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error; // Re-throw for the route handler to catch
    }
  };

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product object
   */
  const getProductById = async (productId) => {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [productId]);

      if (result.rows.length === 0) {
        const error = new Error(`Product with ID ${productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error in getProductById for ID ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  const createProduct = async (productData) => {
    try {
      const { name, price, description, category_id, barcode, sku, image_url, in_stock, cost_price } = productData;

      const result = await pool.query(
        `INSERT INTO products
         (name, price, description, category_id, barcode, sku, image_url, in_stock, cost_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, price, description, category_id, barcode, sku, image_url, in_stock, cost_price]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  };

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  const updateProduct = async (productId, productData) => {
    try {
      // First check if product exists
      const checkResult = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

      if (checkResult.rows.length === 0) {
        const error = new Error(`Product with ID ${productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      // Build the update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(productData)) {
        if (value !== undefined && key !== 'id') {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        return checkResult.rows[0]; // No updates needed
      }

      values.push(productId); // Add productId as the last parameter

      const updateQuery = `
        UPDATE products
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(updateQuery, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateProduct for ID ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Deleted product
   */
  const deleteProduct = async (productId) => {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);

      if (result.rows.length === 0) {
        const error = new Error(`Product with ID ${productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error in deleteProduct for ID ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object>} Product object
   */
  const getProductByBarcode = async (barcode) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE barcode = $1', [barcode]);

      if (result.rows.length === 0) {
        const error = new Error(`Product with barcode ${barcode} not found`);
        error.statusCode = 404;
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error in getProductByBarcode for barcode ${barcode}:`, error);
      throw error;
    }
  };

  /**
   * Get products by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of products
   */
  const getProductsByCategoryId = async (categoryId) => {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = $1
        ORDER BY p.name
      `, [categoryId]);
      return result.rows;
    } catch (error) {
      console.error(`Error in getProductsByCategoryId for category ID ${categoryId}:`, error);
      throw error;
    }
  };

  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   */
  const searchProducts = async (query) => {
    try {
      const searchPattern = `%${query}%`;
      const result = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.name ILIKE $1
         OR p.description ILIKE $1
         OR p.barcode ILIKE $1
         OR p.sku ILIKE $1
         ORDER BY p.name`,
        [searchPattern]
      );

      return result.rows;
    } catch (error) {
      console.error(`Error in searchProducts for query ${query}:`, error);
      throw error;
    }
  };

  return {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    getProductsByCategoryId,
    searchProducts
  };
};

export default createProductService;
