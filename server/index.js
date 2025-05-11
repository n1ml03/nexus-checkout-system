/**
 * Database API Server
 *
 * This file provides a simple Express server that handles database operations
 * for the Nexus Checkout System.
 */

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { createAuthRouter } from './routes/auth.js';
import { createProductRouter } from './routes/products.js';
import { createCustomerRouter } from './routes/customers.js';
import { createOrderRouter } from './routes/orders.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import { createProductService } from './services/productService.js';
import { createCustomerService } from './services/customerService.js';
import { createOrderService } from './services/orderService.js';
import { createAnalyticsService } from './services/analyticsService.js';
import {
  errorLogger,
  notFoundHandler,
  globalErrorHandler,
  sqlInjectionProtection
} from './middleware/error-handler.js';

// Load environment variables
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL configuration
const PG_HOST = process.env.VITE_PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.VITE_PG_PORT || '5432');
const PG_DATABASE = process.env.VITE_PG_DATABASE || 'nexus_checkout';
const PG_USER = process.env.VITE_PG_USER || 'postgres';
const PG_PASSWORD = process.env.VITE_PG_PASSWORD || 'postgres';

// Create a connection pool with optimized settings for production
const pool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
  // Optimized pool settings
  max: 30, // Increased from 20 to 30 for better concurrency
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Increased from 2000 to 5000 for more reliable connections
  statement_timeout: 10000, // Abort queries that take more than 10 seconds
  query_timeout: 10000, // Timeout for queries
  application_name: 'nexus-checkout', // Helps identify connections in pg_stat_activity
  keepAlive: true, // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Delay before starting keepalive
});

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(sqlInjectionProtection);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
const apiRouter = express.Router();

// Apply API rate limiting to all API routes
apiRouter.use(apiLimiter);

// Create services
const productService = createProductService(pool);
const customerService = createCustomerService(pool);
const orderService = createOrderService(pool);
const analyticsService = createAnalyticsService(pool);

// Create route handlers
const authRouter = createAuthRouter(pool);
const productRouter = createProductRouter(productService);
const customerRouter = createCustomerRouter(customerService);
const orderRouter = createOrderRouter(orderService);
const analyticsRouter = createAnalyticsRouter(analyticsService);

// Register routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/analytics', analyticsRouter);

// Execute a raw SQL query - requires authentication and admin role
apiRouter.post('/db/query', authenticateJWT, authorizeRoles(['admin']), async (req, res) => {
  const { sql, params } = req.body;

  if (!sql) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'SQL query is required',
        code: 'MISSING_SQL'
      }
    });
  }

  // Validate SQL query to prevent dangerous operations
  const dangerousOperations = [
    /DROP\s+DATABASE/i,
    /DROP\s+TABLE/i,
    /TRUNCATE\s+TABLE/i,
    /DELETE\s+FROM\s+\w+\s+(?!WHERE)/i, // DELETE without WHERE clause
    /UPDATE\s+\w+\s+SET\s+(?!WHERE)/i,  // UPDATE without WHERE clause
    /ALTER\s+USER/i,
    /CREATE\s+USER/i,
    /GRANT\s+/i
  ];

  for (const pattern of dangerousOperations) {
    if (pattern.test(sql)) {
      return res.status(403).json({
        data: null,
        error: {
          message: 'Potentially dangerous SQL operation detected',
          code: 'DANGEROUS_SQL'
        }
      });
    }
  }

  // Validate params if provided
  if (params && !Array.isArray(params)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Query parameters must be an array',
        code: 'INVALID_PARAMS'
      }
    });
  }

  try {
    const result = await pool.query(sql, params || []);
    return res.json({
      data: result.rows,
      error: null
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Get all rows from a table
apiRouter.get('/db/tables/:table', async (req, res) => {
  const { table } = req.params;
  const { orderBy } = req.query;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  // Validate orderBy parameter if provided
  if (orderBy && typeof orderBy === 'string') {
    const validOrderByRegex = /^[a-zA-Z0-9_]+(?: (ASC|DESC))?$/i;
    if (!validOrderByRegex.test(orderBy)) {
      return res.status(400).json({
        data: null,
        error: {
          message: 'Invalid orderBy parameter',
          code: 'INVALID_ORDER_BY'
        }
      });
    }
  }

  try {
    const sql = `SELECT * FROM ${table}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
    const result = await pool.query(sql);
    return res.json({
      data: result.rows,
      error: null
    });
  } catch (error) {
    console.error(`Error getting all rows from ${table}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Get a row by ID
apiRouter.get('/db/tables/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  try {
    const sql = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: {
          message: `Row with ID ${id} not found in ${table}`,
          code: 'NOT_FOUND'
        }
      });
    }

    return res.json({
      data: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error(`Error getting row with ID ${id} from ${table}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Insert a row into a table - requires authentication
apiRouter.post('/db/tables/:table', authenticateJWT, async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Data is required',
        code: 'MISSING_DATA'
      }
    });
  }

  try {
    const keys = Object.keys(data);

    // Validate column names
    for (const key of keys) {
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        return res.status(400).json({
          data: null,
          error: {
            message: `Invalid column name: ${key}`,
            code: 'INVALID_COLUMN_NAME'
          }
        });
      }
    }

    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(sql, values);

    return res.status(201).json({
      data: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error(`Error inserting row into ${table}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Update a row in a table - requires authentication
apiRouter.put('/db/tables/:table/:id', authenticateJWT, async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Data is required',
        code: 'MISSING_DATA'
      }
    });
  }

  try {
    const keys = Object.keys(data);

    // Validate column names
    for (const key of keys) {
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        return res.status(400).json({
          data: null,
          error: {
            message: `Invalid column name: ${key}`,
            code: 'INVALID_COLUMN_NAME'
          }
        });
      }
    }

    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await pool.query(sql, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: {
          message: `Row with ID ${id} not found in ${table}`,
          code: 'NOT_FOUND'
        }
      });
    }

    return res.json({
      data: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error(`Error updating row with ID ${id} in ${table}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Delete a row from a table - requires admin role
apiRouter.delete('/db/tables/:table/:id', authenticateJWT, authorizeRoles(['admin']), async (req, res) => {
  const { table, id } = req.params;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  try {
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: {
          message: `Row with ID ${id} not found in ${table}`,
          code: 'NOT_FOUND'
        }
      });
    }

    return res.json({
      data: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error(`Error deleting row with ID ${id} from ${table}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Find rows by a field value
apiRouter.get('/db/tables/:table/find', async (req, res) => {
  const { table } = req.params;
  const { field, value } = req.query;

  // Validate table name to prevent SQL injection
  const validTableRegex = /^[a-zA-Z0-9_]+$/;
  if (!validTableRegex.test(table)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid table name',
        code: 'INVALID_TABLE_NAME'
      }
    });
  }

  if (!field || value === undefined) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Field and value are required',
        code: 'MISSING_PARAMS'
      }
    });
  }

  // Validate field name
  if (typeof field !== 'string' || !/^[a-zA-Z0-9_]+$/.test(field)) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Invalid field name',
        code: 'INVALID_FIELD_NAME'
      }
    });
  }

  try {
    const sql = `SELECT * FROM ${table} WHERE ${field} = $1`;
    const result = await pool.query(sql, [value]);

    return res.json({
      data: result.rows,
      error: null
    });
  } catch (error) {
    console.error(`Error finding rows in ${table} where ${field} = ${value}:`, error);
    return res.status(500).json({
      data: null,
      error: {
        message: error.message || 'Database error',
        code: error.code || 'UNKNOWN'
      }
    });
  }
});

// Use API router
app.use('/api', apiRouter);

// Catch-all route to serve the SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorLogger);
app.use(globalErrorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Connected to PostgreSQL at ${PG_HOST}:${PG_PORT}/${PG_DATABASE}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
