/**
 * Error Handler Middleware
 * 
 * This file provides global error handling middleware for the Nexus Checkout System.
 */

/**
 * Error logger
 * @param {Error} err Error object
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
export const errorLogger = (err, req, res, next) => {
  // Log error details
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });
  
  // Pass error to next middleware
  next(err);
};

/**
 * Not found handler
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const notFoundHandler = (req, res, next) => {
  // Create a 404 error
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  
  // Pass error to next middleware
  next(error);
};

/**
 * Global error handler
 * @param {Error} err Error object
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    data: null,
    error: {
      message: statusCode === 500 ? 'Server Error' : err.message,
      code: err.code || 'UNKNOWN_ERROR',
      // Include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * SQL injection protection middleware
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const sqlInjectionProtection = (req, res, next) => {
  // Check for SQL injection patterns in request body
  const checkForSqlInjection = (obj) => {
    if (!obj) return false;
    
    // SQL injection patterns to check for
    const sqlPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i
    ];
    
    // Check each value in the object
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object') {
        if (checkForSqlInjection(obj[key])) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Check request body, query, and params
  if (
    checkForSqlInjection(req.body) ||
    checkForSqlInjection(req.query) ||
    checkForSqlInjection(req.params)
  ) {
    const error = new Error('Potential SQL injection detected');
    error.statusCode = 403;
    error.code = 'SQL_INJECTION';
    return next(error);
  }
  
  next();
};

/**
 * Request validation middleware
 * @param {Object} schema Joi schema for validation
 * @returns {Function} Middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();
    
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      const validationError = new Error(errorMessage);
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      return next(validationError);
    }
    
    next();
  };
};

export default {
  errorLogger,
  notFoundHandler,
  globalErrorHandler,
  sqlInjectionProtection,
  validateRequest
};
