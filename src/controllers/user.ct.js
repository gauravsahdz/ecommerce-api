import User from '../models/User.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get users with filters or a single user by ID
export const getUsers = asyncHandler(async (req, res) => {
  const { 
    id, 
    name, 
    email,
    role,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // If ID is provided, return single user
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return responseHandler.success(res, {
      data: { user }
    });
  }

  // Build filter for list operation
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (role) filter.role = role;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await User.countDocuments(filter);

  // Get paginated results
  const users = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { users },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage
    },
    filters: {
      applied: Object.keys(filter).length > 0 ? filter : null,
      available: {
        id,
        name,
        email,
        role
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new user
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = new User({
    name,
    email,
    password,
    role
  });

  const savedUser = await user.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: { user: savedUser },
    meta: { id: savedUser._id }
  });
});

// Update a user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const updates = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return responseHandler.success(res, {
    message: 'User updated successfully',
    data: { user: updatedUser },
    meta: { id: updatedUser._id }
  });
});

// Delete a user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    throw new ApiError(404, 'User not found');
  }

  return responseHandler.success(res, {
    message: 'User deleted successfully',
    meta: { id: deletedUser._id }
  });
});