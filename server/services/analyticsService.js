/**
 * Analytics Service
 *
 * This file provides service methods for analytics-related operations.
 * It encapsulates business logic and database interactions.
 */

import { Pool } from 'pg';

/**
 * Create analytics service with the provided database pool
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Object} Analytics service methods
 */
export const createAnalyticsService = (pool) => {
  /**
   * Get sales data
   * @param {Object} options - Query options (period, start_date, end_date)
   * @returns {Promise<Array>} Sales data
   */
  const getSalesData = async (options = {}) => {
    try {
      const { period = 'daily', start_date, end_date } = options;

      let timeFormat;
      let groupBy;

      switch (period) {
        case 'hourly':
          timeFormat = 'YYYY-MM-DD HH24:00';
          groupBy = 'DATE_TRUNC(\'hour\', created_at)';
          break;
        case 'daily':
          timeFormat = 'YYYY-MM-DD';
          groupBy = 'DATE_TRUNC(\'day\', created_at)';
          break;
        case 'weekly':
          timeFormat = 'YYYY-"W"IW';
          groupBy = 'DATE_TRUNC(\'week\', created_at)';
          break;
        case 'monthly':
          timeFormat = 'YYYY-MM';
          groupBy = 'DATE_TRUNC(\'month\', created_at)';
          break;
        case 'yearly':
          timeFormat = 'YYYY';
          groupBy = 'DATE_TRUNC(\'year\', created_at)';
          break;
        default:
          timeFormat = 'YYYY-MM-DD';
          groupBy = 'DATE_TRUNC(\'day\', created_at)';
      }

      let query = `
        SELECT
          TO_CHAR(${groupBy}, '${timeFormat}') as time_period,
          COUNT(*) as order_count,
          SUM(total_amount) as total_sales
        FROM orders
        WHERE status = 'completed'
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND created_at >= $${paramIndex}`;
        queryParams.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND created_at <= $${paramIndex}`;
        queryParams.push(end_date);
        paramIndex++;
      }

      query += `
        GROUP BY ${groupBy}
        ORDER BY ${groupBy}
      `;

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error in getSalesData:', error);
      throw error;
    }
  };

  /**
   * Get revenue data
   * @param {Object} options - Query options (period, start_date, end_date)
   * @returns {Promise<Array>} Revenue data
   */
  const getRevenueData = async (options = {}) => {
    try {
      const { period = 'monthly', start_date, end_date } = options;

      let timeFormat;
      let groupBy;

      switch (period) {
        case 'daily':
          timeFormat = 'YYYY-MM-DD';
          groupBy = 'DATE_TRUNC(\'day\', created_at)';
          break;
        case 'weekly':
          timeFormat = 'YYYY-"W"IW';
          groupBy = 'DATE_TRUNC(\'week\', created_at)';
          break;
        case 'monthly':
          timeFormat = 'YYYY-MM';
          groupBy = 'DATE_TRUNC(\'month\', created_at)';
          break;
        case 'yearly':
          timeFormat = 'YYYY';
          groupBy = 'DATE_TRUNC(\'year\', created_at)';
          break;
        default:
          timeFormat = 'YYYY-MM';
          groupBy = 'DATE_TRUNC(\'month\', created_at)';
      }

      let query = `
        SELECT
          TO_CHAR(${groupBy}, '${timeFormat}') as time_period,
          SUM(total_amount) as revenue,
          SUM(oi.quantity * p.cost_price) as cost,
          SUM(total_amount) - SUM(oi.quantity * p.cost_price) as profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed'
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND o.created_at >= $${paramIndex}`;
        queryParams.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND o.created_at <= $${paramIndex}`;
        queryParams.push(end_date);
        paramIndex++;
      }

      query += `
        GROUP BY ${groupBy}
        ORDER BY ${groupBy}
      `;

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error in getRevenueData:', error);
      throw error;
    }
  };

  /**
   * Get product performance data
   * @param {Object} options - Query options (limit, start_date, end_date, category)
   * @returns {Promise<Array>} Product performance data
   */
  const getProductPerformance = async (options = {}) => {
    try {
      const { limit = 10, start_date, end_date, category } = options;

      let query = `
        SELECT
          p.id,
          p.name,
          p.category,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.quantity * oi.unit_price) as total_sales,
          COUNT(DISTINCT o.id) as order_count
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND o.created_at >= $${paramIndex}`;
        queryParams.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND o.created_at <= $${paramIndex}`;
        queryParams.push(end_date);
        paramIndex++;
      }

      if (category) {
        query += ` AND p.category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      query += `
        GROUP BY p.id, p.name, p.category
        ORDER BY total_sales DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error in getProductPerformance:', error);
      throw error;
    }
  };

  /**
   * Get customer insights
   * @param {Object} options - Query options (limit, start_date, end_date)
   * @returns {Promise<Array>} Customer insights data
   */
  const getCustomerInsights = async (options = {}) => {
    try {
      const { limit = 10, start_date, end_date } = options;

      let query = `
        SELECT
          c.id,
          c.name,
          c.email,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_spent,
          AVG(o.total_amount) as average_order_value,
          MAX(o.created_at) as last_order_date
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        WHERE o.status = 'completed'
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND o.created_at >= $${paramIndex}`;
        queryParams.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND o.created_at <= $${paramIndex}`;
        queryParams.push(end_date);
        paramIndex++;
      }

      query += `
        GROUP BY c.id, c.name, c.email
        ORDER BY total_spent DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error in getCustomerInsights:', error);
      throw error;
    }
  };

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} Dashboard summary data
   */
  const getDashboardSummary = async () => {
    try {
      // Get total sales
      const salesResult = await pool.query(`
        SELECT SUM(total_amount) as total_sales
        FROM orders
        WHERE status = 'completed'
      `);

      // Get total orders
      const ordersResult = await pool.query(`
        SELECT COUNT(*) as total_orders
        FROM orders
      `);

      // Get total customers
      const customersResult = await pool.query(`
        SELECT COUNT(*) as total_customers
        FROM customers
      `);

      // Get total products
      const productsResult = await pool.query(`
        SELECT COUNT(*) as total_products
        FROM products
      `);

      // Get recent orders
      const recentOrdersResult = await pool.query(`
        SELECT o.*, c.name as customer_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      // Get low stock products
      const lowStockResult = await pool.query(`
        SELECT *
        FROM products
        WHERE in_stock = true AND stock <= 5
        ORDER BY stock ASC
        LIMIT 5
      `);

      // Get sales growth (comparing to previous period)
      const salesGrowthResult = await pool.query(`
        SELECT
          COALESCE(
            (
              SELECT SUM(total_amount)
              FROM orders
              WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
            ) /
            NULLIF(
              (
                SELECT SUM(total_amount)
                FROM orders
                WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
              ), 0
            ) * 100 - 100,
            0
          ) as sales_growth
      `);

      // Get customer growth
      const customerGrowthResult = await pool.query(`
        SELECT
          COALESCE(
            (
              SELECT COUNT(*)
              FROM customers
              WHERE created_at >= NOW() - INTERVAL '30 days'
            ) /
            NULLIF(
              (
                SELECT COUNT(*)
                FROM customers
                WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
              ), 0
            ) * 100 - 100,
            0
          ) as customer_growth
      `);

      // Get conversion rate (orders / visitors, using a simplified calculation)
      const conversionRateResult = await pool.query(`
        SELECT
          COALESCE(
            (SELECT COUNT(*) FROM orders WHERE status = 'completed') * 100.0 /
            NULLIF((SELECT COUNT(*) FROM customers), 0),
            0
          ) as conversion_rate
      `);

      // Get conversion growth
      const conversionGrowthResult = await pool.query(`
        SELECT
          COALESCE(
            (
              SELECT COUNT(*)
              FROM orders
              WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
            ) * 100.0 /
            NULLIF(
              (
                SELECT COUNT(*)
                FROM customers
                WHERE created_at >= NOW() - INTERVAL '30 days'
              ), 0
            ) -
            (
              SELECT COUNT(*)
              FROM orders
              WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
            ) * 100.0 /
            NULLIF(
              (
                SELECT COUNT(*)
                FROM customers
                WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
              ), 0
            ),
            0
          ) as conversion_growth
      `);

      // Get average order value
      const avgOrderValueResult = await pool.query(`
        SELECT
          COALESCE(
            (SELECT SUM(total_amount) FROM orders WHERE status = 'completed') /
            NULLIF((SELECT COUNT(*) FROM orders WHERE status = 'completed'), 0),
            0
          ) as avg_order_value
      `);

      // Get sales data for chart
      const salesDataResult = await pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
          SUM(total_amount) as sales
        FROM orders
        WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `);

      // Get category data for chart
      const categoryDataResult = await pool.query(`
        SELECT
          p.category as name,
          SUM(oi.price * oi.quantity) as value
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed' AND o.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY p.category
        ORDER BY value DESC
        LIMIT 5
      `);

      // Get top products
      const topProductsResult = await pool.query(`
        SELECT
          p.id,
          p.name,
          SUM(oi.price * oi.quantity) as sales,
          SUM(oi.quantity) as quantity
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed' AND o.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY p.id, p.name
        ORDER BY sales DESC
        LIMIT 5
      `);

      return {
        total_sales: parseFloat(salesResult.rows[0]?.total_sales || 0),
        total_orders: parseInt(ordersResult.rows[0]?.total_orders || 0),
        total_customers: parseInt(customersResult.rows[0]?.total_customers || 0),
        total_products: parseInt(productsResult.rows[0]?.total_products || 0),
        sales_growth: parseFloat(salesGrowthResult.rows[0]?.sales_growth || 0),
        customer_growth: parseFloat(customerGrowthResult.rows[0]?.customer_growth || 0),
        conversion_rate: parseFloat(conversionRateResult.rows[0]?.conversion_rate || 0),
        conversion_growth: parseFloat(conversionGrowthResult.rows[0]?.conversion_growth || 0),
        avg_order_value: parseFloat(avgOrderValueResult.rows[0]?.avg_order_value || 0),
        recent_orders: recentOrdersResult.rows,
        low_stock_products: lowStockResult.rows,
        sales_data: salesDataResult.rows.map(row => ({
          month: row.month,
          sales: parseFloat(row.sales || 0)
        })),
        category_data: categoryDataResult.rows.map(row => ({
          name: row.name,
          value: parseFloat(row.value || 0)
        })),
        top_products: topProductsResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          sales: parseFloat(row.sales || 0),
          quantity: parseInt(row.quantity || 0)
        }))
      };
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      throw error;
    }
  };

  return {
    getSalesData,
    getRevenueData,
    getProductPerformance,
    getCustomerInsights,
    getDashboardSummary
  };
};

export default createAnalyticsService;
