/**
 * Analytics Routes
 * 
 * This file provides API routes for analytics-related operations.
 */

import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

/**
 * Create analytics router
 * @param {Object} analyticsService - Analytics service
 * @returns {express.Router} Express router
 */
export const createAnalyticsRouter = (analyticsService) => {
  const router = express.Router();

  /**
   * @route GET /api/analytics/sales
   * @desc Get sales data
   * @access Protected (admin, manager)
   */
  router.get('/sales', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const { period, start_date, end_date } = req.query;
      
      const options = {
        period,
        start_date,
        end_date
      };
      
      const salesData = await analyticsService.getSalesData(options);
      res.json({
        data: salesData,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/analytics/revenue
   * @desc Get revenue data
   * @access Protected (admin, manager)
   */
  router.get('/revenue', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const { period, start_date, end_date } = req.query;
      
      const options = {
        period,
        start_date,
        end_date
      };
      
      const revenueData = await analyticsService.getRevenueData(options);
      res.json({
        data: revenueData,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/analytics/products
   * @desc Get product performance
   * @access Protected (admin, manager)
   */
  router.get('/products', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const { limit, start_date, end_date, category } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit) : 10,
        start_date,
        end_date,
        category
      };
      
      const productData = await analyticsService.getProductPerformance(options);
      res.json({
        data: productData,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/analytics/customers
   * @desc Get customer insights
   * @access Protected (admin, manager)
   */
  router.get('/customers', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
    try {
      const { limit, start_date, end_date } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit) : 10,
        start_date,
        end_date
      };
      
      const customerData = await analyticsService.getCustomerInsights(options);
      res.json({
        data: customerData,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route GET /api/analytics/dashboard
   * @desc Get dashboard summary
   * @access Protected
   */
  router.get('/dashboard', authenticateJWT, async (req, res, next) => {
    try {
      const dashboardData = await analyticsService.getDashboardSummary();
      res.json({
        data: dashboardData,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createAnalyticsRouter;
