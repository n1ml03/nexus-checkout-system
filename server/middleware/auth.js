/**
 * Authentication Middleware
 *
 * This file provides JWT authentication middleware and token utilities
 * for the Nexus Checkout System.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set. This is a security risk!');
  // In production, we should exit the process, but for development we'll use a fallback
  if (process.env.NODE_ENV === 'production') {
    console.error('Exiting due to missing JWT_SECRET in production environment');
    process.exit(1);
  }
}

// Use a secure fallback only for development
const JWT_SECRET_VALUE = JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'nexus-checkout-dev-secret-do-not-use-in-production' : '');
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user User object
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokens = (user) => {
  // Generate access token with user information and role
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET_VALUE,
    { expiresIn: JWT_EXPIRY }
  );

  // Generate refresh token with minimal information
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET_VALUE,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT middleware
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      data: null,
      error: {
        message: 'Authorization header missing',
        code: 'AUTH_HEADER_MISSING'
      }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, JWT_SECRET_VALUE);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      data: null,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

/**
 * Verify refresh token and generate new access token
 * @param {string} refreshToken Refresh token
 * @param {Object} pool Database connection pool
 * @returns {Object} Object containing new access token or error
 */
export const refreshAccessToken = async (refreshToken, pool) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  if (!pool) {
    throw new Error('Database pool is required');
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET_VALUE);

    if (!decoded || !decoded.id) {
      throw new Error('Invalid refresh token format');
    }

    // Check if the refresh token exists in the database
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND refresh_token = $2',
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const user = result.rows[0];

    // Generate a new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET_VALUE,
      { expiresIn: JWT_EXPIRY }
    );

    return { accessToken };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else {
      throw error;
    }
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles Array of allowed roles
 * @returns {Function} Middleware function
 */
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        data: null,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        data: null,
        error: {
          message: 'Forbidden: Insufficient permissions',
          code: 'FORBIDDEN'
        }
      });
    }

    next();
  };
};

/**
 * Hash a password
 * @param {string} password Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password Plain text password
 * @param {string} hash Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * @param {string} password Password to validate
 * @returns {boolean} True if password is strong enough
 */
export const validatePasswordStrength = (password) => {
  // Password must be at least 8 characters long and contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export default {
  generateTokens,
  authenticateJWT,
  refreshAccessToken,
  authorizeRoles,
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
