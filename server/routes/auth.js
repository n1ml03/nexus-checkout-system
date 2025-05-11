/**
 * Authentication Routes
 *
 * This file provides authentication routes for the Nexus Checkout System.
 */

import express from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { authLimiter, createUserLimiter } from '../middleware/rate-limit.js';
import { createAuthService } from '../services/authService.js';

// User role enum values
const userRoleEnum = [
  'user',
  'staff',
  'manager',
  'admin'
];

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// Register validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(userRoleEnum).optional().default('user')
});

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

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT tokens
 * @access Public
 */
export const createAuthRouter = (pool) => {
  // Create auth service
  const authService = createAuthService(pool);

  router.post('/login', authLimiter, validateRequest(loginSchema), async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);

      return res.json({
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   * @access Public
   */
  router.post('/register', createUserLimiter, validateRequest(registerSchema), async (req, res, next) => {
    const { email, password, name, role } = req.body;

    try {
      const result = await authService.register(email, password, name, role);

      return res.status(201).json({
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/auth/refresh
   * @desc Refresh access token
   * @access Public
   */
  router.post('/refresh', async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        data: null,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_TOKEN'
        }
      });
    }

    try {
      const result = await authService.refresh(refreshToken);

      return res.json({
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @route POST /api/auth/logout
   * @desc Logout user and invalidate refresh token
   * @access Protected
   */
  router.post('/logout', authenticateJWT, async (req, res, next) => {
    try {
      await authService.logout(req.user.id);

      return res.json({
        data: { message: 'Logged out successfully' },
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createAuthRouter;
