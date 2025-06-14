import jwt from 'jsonwebtoken';
import UserModel from '../models/User.mo.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        type: 'ERROR',
        message: 'No token provided',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        type: 'ERROR',
        message: 'User not found',
        data: null
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        type: 'ERROR',
        message: 'User account is inactive',
        data: null
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        type: 'ERROR',
        message: 'Invalid token',
        data: null
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        type: 'ERROR',
        message: 'Token expired',
        data: null
      });
    }
    return res.status(500).json({
      type: 'ERROR',
      message: 'Server error',
      data: null
    });
  }
};

export const authorize = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          type: 'ERROR',
          message: 'Authentication required',
          data: null
        });
      }

      if (req.user.role !== role) {
        return res.status(403).json({
          type: 'ERROR',
          message: `${role} access required`,
          data: null
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        type: 'ERROR',
        message: 'Server error',
        data: null
      });
    }
  }
};
