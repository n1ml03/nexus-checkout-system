/**
 * Authentication Service
 *
 * This file provides service methods for authentication-related operations.
 * It encapsulates business logic and database interactions.
 */

import { Pool } from 'pg';
import {
  generateTokens,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  refreshAccessToken
} from '../middleware/auth.js';

/**
 * Create authentication service with the provided database pool
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Object} Authentication service methods
 */
export const createAuthService = (pool) => {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  const login = async (email, password) => {
    try {
      // Get user from database
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      // Check if user exists
      if (result.rows.length === 0) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }

      // Generate tokens
      const tokens = generateTokens(user);

      // Store refresh token in database
      await pool.query(
        'UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2',
        [tokens.refreshToken, user.id]
      );

      // Return user data and tokens
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'user'
        },
        tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @param {string} role - User role (default: 'user')
   * @returns {Promise<Object>} User data and tokens
   */
  const register = async (email, password, name, role = 'user') => {
    try {
      // Validate password strength
      if (!validatePasswordStrength(password)) {
        const error = new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        error.statusCode = 400;
        error.code = 'WEAK_PASSWORD';
        throw error;
      }

      // Check if user already exists
      const checkResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (checkResult.rows.length > 0) {
        const error = new Error('User already exists');
        error.statusCode = 409;
        error.code = 'USER_EXISTS';
        throw error;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Start a transaction
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Create user
        const result = await client.query(
          'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
          [email, hashedPassword, name, role]
        );

        const user = result.rows[0];

        // Generate tokens
        const tokens = generateTokens(user);

        // Store refresh token in database
        await client.query(
          'UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2',
          [tokens.refreshToken, user.id]
        );

        // Create profile
        await client.query(
          'INSERT INTO profiles (id, name) VALUES ($1, $2)',
          [user.id, name]
        );

        await client.query('COMMIT');

        // Return user data and tokens
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          tokens
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  const refresh = async (refreshToken) => {
    try {
      return await refreshAccessToken(refreshToken, pool);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  /**
   * Logout user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  const logout = async (userId) => {
    try {
      // Clear refresh token in database
      await pool.query(
        'UPDATE users SET refresh_token = NULL WHERE id = $1',
        [userId]
      );
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Get current user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  const getCurrentUser = async (userId) => {
    try {
      const result = await pool.query(
        'SELECT id, email, name, role FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  };

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  const updateProfile = async (userId, userData) => {
    try {
      const { name, email } = userData;

      // Check if user exists
      const checkResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (checkResult.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      // Update user
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, name, role',
        [name, email, userId]
      );

      // Update profile
      await pool.query(
        'UPDATE profiles SET name = $1 WHERE id = $2',
        [name, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  const changePassword = async (userId, currentPassword, newPassword) => {
    try {
      // Get user
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      const user = userResult.rows[0];

      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.password);

      if (!isPasswordValid) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        error.code = 'INVALID_PASSWORD';
        throw error;
      }

      // Validate new password strength
      if (!validatePasswordStrength(newPassword)) {
        const error = new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        error.statusCode = 400;
        error.code = 'WEAK_PASSWORD';
        throw error;
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  return {
    login,
    register,
    refresh,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword
  };
};

export default createAuthService;
