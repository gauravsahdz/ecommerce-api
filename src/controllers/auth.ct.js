import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.mo.js';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Register a new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  const savedUser = await user.save();

  // Return the saved user without the password
  const userResponse = savedUser.toObject();
  delete userResponse.password;

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: { user: userResponse },
    meta: { id: savedUser._id }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Email not found');
  }

  const passwordMatched = await bcrypt.compare(password, user.password);
  
  if (!passwordMatched) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return user data without password
  const userResponse = user.toObject();
  delete userResponse.password;

  return responseHandler.success(res, {
    message: 'Login successful',
    data: { 
      user: userResponse,
      token
    },
    meta: { id: user._id }
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return responseHandler.success(res, {
    data: { user }
  });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  // In a real application, you would handle token invalidation here
  return responseHandler.success(res, {
    message: 'Logged out successfully'
  });
});