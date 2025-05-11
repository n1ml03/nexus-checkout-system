/**
 * Customer Routes
 * 
 * This file provides API routes for customer-related operations.
 */

import express from 'express';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

// Create customer validation schema
const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

// Update customer validation schema
const updateCustomerSchema = createCustomerSchema.partial();

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
 * Create customer router
 * @param {Object} customerService - Customer service
 * @returns {express.Router} Express router
 */
export const createCustomerRouter = (customerService) => {
  const router = express.Router();

  /**
   * @route GET /api/customers
   * @desc Get all customers
   * @access Protected
   */
  router.get('/', authenticateJWT, async (req, res, next) => {
    try {
      const customers = await customerService.getAllCustomers();
      res.json({
        data: customers,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/customers/:id
   * @desc Get customer by ID
   * @access Protected
   */
  router.get('/:id', authenticateJWT, async (req, res, next) => {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.json({
        data: customer,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/customers
   * @desc Create a new customer
   * @access Protected
   */
  router.post('/', authenticateJWT, validateRequest(createCustomerSchema), async (req, res, next) => {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({
        data: customer,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route PUT /api/customers/:id
   * @desc Update a customer
   * @access Protected
   */
  router.put('/:id', authenticateJWT, validateRequest(updateCustomerSchema), async (req, res, next) => {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body);
      res.json({
        data: customer,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route DELETE /api/customers/:id
   * @desc Delete a customer
   * @access Protected (admin, manager)
   */
  router.delete('/:id', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const customer = await customerService.deleteCustomer(req.params.id);
      res.json({
        data: customer,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/customers/search
   * @desc Search customers
   * @access Protected
   */
  router.get('/search', authenticateJWT, async (req, res, next) => {
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
      
      const customers = await customerService.searchCustomers(q);
      res.json({
        data: customers,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/customers/:id/orders
   * @desc Get customer orders
   * @access Protected
   */
  router.get('/:id/orders', authenticateJWT, async (req, res, next) => {
    try {
      const orders = await customerService.getCustomerOrders(req.params.id);
      res.json({
        data: orders,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createCustomerRouter;
