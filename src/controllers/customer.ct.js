import Customer from '../models/Customer.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

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
  const total = await Customer.countDocuments(filter);

  // Get paginated results
  const customers = await Customer.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { customers },
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
  const customer = await Customer.findById(req.params.id);
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

  const newCustomer = new Customer({
    name,
    email,
    phone,
    address
  });

  const savedCustomer = await newCustomer.save();
  
  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Customer created successfully',
    data: { customer: savedCustomer },
    meta: { id: savedCustomer._id }
  });
});

// Update a customer
export const updateCustomer = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  return responseHandler.success(res, {
    message: 'Customer updated successfully',
    data: { customer: updatedCustomer },
    meta: { id: updatedCustomer._id }
  });
});

// Delete a customer
export const deleteCustomer = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
  if (!deletedCustomer) {
    throw new ApiError(404, 'Customer not found');
  }

  return responseHandler.success(res, {
    message: 'Customer deleted successfully',
    meta: { id: deletedCustomer._id }
  });
});