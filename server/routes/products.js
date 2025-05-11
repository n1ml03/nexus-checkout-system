/**
 * Product Routes
 *
 * This file provides API routes for product-related operations.
 */

import express from 'express';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

// Create product validation schema
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  image_url: z.string().url().optional(),
  in_stock: z.boolean().optional(),
  cost_price: z.number().min(0).optional()
});

// Update product validation schema
const updateProductSchema = createProductSchema.partial();

// Validation middleware
const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      data: null,
      error: {
        message: 'Validation error',
        details: error.errors
      }
    });
  }
};

/**
 * Create product router
 * @param {Object} productService - Product service
 * @returns {express.Router} Express router
 */
export const createProductRouter = (productService) => {
  const router = express.Router();

  /**
   * @route GET /api/products
   * @desc Get all products
   * @access Public
   */
  router.get('/', async (req, res, next) => {
    try {
      const products = await productService.getAllProducts();
      res.json({
        data: products,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/products/:id
   * @desc Get product by ID
   * @access Public
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({
        data: product,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/products
   * @desc Create a new product
   * @access Protected (admin, manager)
   */
  router.post('/', authenticateJWT, authorizeRoles(['admin', 'manager']), validateRequest(createProductSchema), async (req, res, next) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        data: product,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route PUT /api/products/:id
   * @desc Update a product
   * @access Protected (admin, manager)
   */
  router.put('/:id', authenticateJWT, authorizeRoles(['admin', 'manager']), validateRequest(updateProductSchema), async (req, res, next) => {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        data: product,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route DELETE /api/products/:id
   * @desc Delete a product
   * @access Protected (admin)
   */
  router.delete('/:id', authenticateJWT, authorizeRoles(['admin']), async (req, res, next) => {
    try {
      const product = await productService.deleteProduct(req.params.id);
      res.json({
        data: product,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/products/barcode/:code
   * @desc Get product by barcode
   * @access Public
   */
  router.get('/barcode/:code', async (req, res, next) => {
    try {
      const product = await productService.getProductByBarcode(req.params.code);
      res.json({
        data: product,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/products/category/:categoryId
   * @desc Get products by category ID
   * @access Public
   */
  router.get('/category/:categoryId', async (req, res, next) => {
    try {
      const products = await productService.getProductsByCategoryId(req.params.categoryId);
      res.json({
        data: products,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/products/search
   * @desc Search products
   * @access Public
   */
  router.get('/search', async (req, res, next) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          data: null,
          error: {
            message: 'Search query is required',
            code: 'MISSING_QUERY'
          }
        });
      }

      const products = await productService.searchProducts(q);
      res.json({
        data: products,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createProductRouter;
