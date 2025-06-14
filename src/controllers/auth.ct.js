import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.mo.js';
import { ApiResponse, ApiError } from '../utils/responseHandler.ut.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'Email already registered', 400);
    }

    // Create new user
    const user = new UserModel({
      name,
      email,
      password
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // TODO: Send verification email

    return ApiResponse.success(res, 'Registration successful', {
      user: user.toJSON(),
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return ApiResponse.error(res, 'Registration failed');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    // Find user and include password
    const user = await UserModel.findOne({ email: email.toString() }).select('+password');
    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return ApiResponse.unauthorized(res, 'Account is inactive');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from user object
    const userResponse = user.toJSON();
    delete userResponse.password;

    return ApiResponse.success(res, 'Login successful', {
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponse.error(res, 'Login failed');
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerified: false
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired verification token', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return ApiResponse.success(res, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    return ApiResponse.error(res, 'Email verification failed');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return ApiResponse.error(res, 'No account found with this email', 404);
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send reset password email

    return ApiResponse.success(res, 'Password reset instructions sent to your email');
  } catch (error) {
    console.error('Forgot password error:', error);
    return ApiResponse.error(res, 'Failed to process password reset request');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return ApiResponse.success(res, 'Password reset successful');
  } catch (error) {
    console.error('Reset password error:', error);
    return ApiResponse.error(res, 'Password reset failed');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return ApiResponse.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return ApiResponse.error(res, 'Password change failed');
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    return ApiResponse.success(res, 'Profile retrieved successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return ApiResponse.error(res, 'Failed to retrieve profile');
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await UserModel.findById(req.user._id);

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return ApiResponse.error(res, 'Email already taken', 400);
      }
      user.email = email;
      user.emailVerified = false;
      const verificationToken = user.generateEmailVerificationToken();
      // TODO: Send verification email
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    return ApiResponse.success(res, 'Profile updated successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return ApiResponse.error(res, 'Profile update failed');
  }
};