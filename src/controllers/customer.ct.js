import CustomerModel from '../models/Customer.mo.js';
import mongoose from 'mongoose';
import { ApiResponse, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get all customers with filters
export const getCustomers = asyncHandler(async (req, res) => {
  const { 
    id, 
    name, 
    email,
    phone,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (id && mongoose.Types.ObjectId.isValid(id)) filter._id = id;
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (phone) filter.phone = { $regex: phone, $options: 'i' };

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await CustomerModel.countDocuments(filter);

  // Get paginated results
  const customers = await CustomerModel.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return ApiResponse.paginated(res, 'Customers retrieved successfully', { customers }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage,
    hasPrevPage,
    filters: {
      applied: Object.keys(filter).length > 0 ? filter : null,
      available: {
        id,
        name,
        email,
        phone
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Get a single customer by ID
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  res.status(200).json({
    type: 'OK',
    customer
  });
});

// Create a new customer
export const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  const newCustomer = new CustomerModel({
    name,
    email,
    phone,
    address
  });

  const savedCustomer = await newCustomer.save();
  
  return ApiResponse.success(res, 'Customer created successfully', { customer: savedCustomer }, 201);
});

// Update a customer
export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  const updatedCustomer = await CustomerModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updatedCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  return ApiResponse.success(res, 'Customer updated successfully', { customer: updatedCustomer });
});

// Delete a customer
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  const deletedCustomer = await CustomerModel.findByIdAndDelete(id);
  if (!deletedCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  return ApiResponse.success(res, 'Customer deleted successfully');
});