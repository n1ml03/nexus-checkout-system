/**
 * Order Routes
 *
 * This file provides API routes for order-related operations.
 */

import express from 'express';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

// Order item schema
const orderItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unit_price: z.number().min(0, "Unit price must be non-negative")
});

// Order status enum values
const orderStatusEnum = [
  'pending',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
];

// Payment status enum values
const paymentStatusEnum = [
  'unpaid',
  'paid',
  'pending',
  'failed',
  'refunded'
];

// Create order validation schema
const createOrderSchema = z.object({
  customer_id: z.string().uuid("Invalid customer ID").optional(),
  total_amount: z.number().min(0, "Total amount must be non-negative"),
  status: z.enum(orderStatusEnum).default('pending'),
  payment_method: z.string().optional(),
  payment_status: z.enum(paymentStatusEnum).default('unpaid'),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).optional()
});

// Update order validation schema
const updateOrderSchema = createOrderSchema.partial();

// Update order status validation schema
const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusEnum, "Invalid order status")
});

// Add order item validation schema
const addOrderItemSchema = orderItemSchema;

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
 * Create order router
 * @param {Object} orderService - Order service
 * @returns {express.Router} Express router
 */
export const createOrderRouter = (orderService) => {
  const router = express.Router();

  /**
   * @route GET /api/orders
   * @desc Get all orders
   * @access Protected
   */
  router.get('/', authenticateJWT, async (req, res, next) => {
    try {
      const orders = await orderService.getAllOrders();
      res.json({
        data: orders,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/orders/:id
   * @desc Get order by ID
   * @access Protected
   */
  router.get('/:id', authenticateJWT, async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({
        data: order,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/orders
   * @desc Create a new order
   * @access Protected
   */
  router.post('/', authenticateJWT, validateRequest(createOrderSchema), async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({
        data: order,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route PUT /api/orders/:id
   * @desc Update an order
   * @access Protected
   */
  router.put('/:id', authenticateJWT, validateRequest(updateOrderSchema), async (req, res, next) => {
    try {
      const order = await orderService.updateOrder(req.params.id, req.body);
      res.json({
        data: order,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route DELETE /api/orders/:id
   * @desc Delete an order
   * @access Protected (admin, manager)
   */
  router.delete('/:id', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const order = await orderService.deleteOrder(req.params.id);
      res.json({
        data: order,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route PUT /api/orders/:id/status
   * @desc Update order status
   * @access Protected
   */
  router.put('/:id/status', authenticateJWT, validateRequest(updateOrderStatusSchema), async (req, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json({
        data: order,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/orders/:id/items
   * @desc Get order items
   * @access Protected
   */
  router.get('/:id/items', authenticateJWT, async (req, res, next) => {
    try {
      const items = await orderService.getOrderItems(req.params.id);
      res.json({
        data: items,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/orders/:id/items
   * @desc Add item to order
   * @access Protected
   */
  router.post('/:id/items', authenticateJWT, validateRequest(addOrderItemSchema), async (req, res, next) => {
    try {
      const item = await orderService.addOrderItem(req.params.id, req.body);
      res.status(201).json({
        data: item,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route DELETE /api/orders/:id/items/:itemId
   * @desc Remove item from order
   * @access Protected
   */
  router.delete('/:id/items/:itemId', authenticateJWT, async (req, res, next) => {
    try {
      const item = await orderService.removeOrderItem(req.params.id, req.params.itemId);
      res.json({
        data: item,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createOrderRouter;
