import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/responseHandler.ut.js';

export const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token expired');
    }
    throw error;
  }
};

// Optional: Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized');
    }
    next();
  };
}; 