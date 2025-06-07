/**
 * Global response handler for consistent API responses
 */
export const responseHandler = {
  /**
   * Success response handler
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {Object} data - Response data
   * @param {Object} meta - Additional metadata
   */
  success: (res, { statusCode = 200, message = 'Success', data = null, meta = {} } = {}) => {
    const response = {
      type: 'OK',
      message,
      ...(data && { data }),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
    return res.status(statusCode).json(response);
  },

  /**
   * Error response handler
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error: (res, { statusCode = 500, message = 'Internal Server Error', meta = {} } = {}) => {
    const response = {
      type: 'ERROR',
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
    return res.status(statusCode).json(response);
  },

  /**
   * List response handler with pagination
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {Object} pagination - Pagination metadata
   * @param {Object} filters - Applied filters
   * @param {Object} sort - Sort information
   */
  list: (res, { data, pagination, filters, sort } = {}) => {
    const response = {
      type: 'OK',
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...pagination,
        filters: {
          applied: filters?.applied || null,
          available: filters?.available || {}
        },
        sort: sort || { by: 'createdAt', order: 'desc' }
      }
    };
    return res.status(200).json(response);
  }
};

/**
 * Global error handler for async functions
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Async Error:', error);
    responseHandler.error(res, {
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
      meta: {
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  });
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error handler
 * @param {Error} error - Validation error
 * @returns {Object} Formatted error response
 */
export const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message
  }));
  
  return {
    statusCode: 400,
    message: 'Validation Error',
    meta: {
      errors
    }
  };
};

/**
 * MongoDB duplicate key error handler
 * @param {Error} error - Duplicate key error
 * @returns {Object} Formatted error response
 */
export const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return {
    statusCode: 409,
    message: `Duplicate value for ${field}`,
    meta: {
      field,
      value: error.keyValue[field]
    }
  };
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error:', err);

  if (err instanceof ApiError) {
    return responseHandler.error(res, {
      statusCode: err.statusCode,
      message: err.message
    });
  }

  if (err.name === 'ValidationError') {
    const errorResponse = handleValidationError(err);
    return responseHandler.error(res, errorResponse);
  }

  if (err.code === 11000) {
    const errorResponse = handleDuplicateKeyError(err);
    return responseHandler.error(res, errorResponse);
  }

  return responseHandler.error(res, {
    statusCode: 500,
    message: 'Internal Server Error',
    meta: {
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}; 