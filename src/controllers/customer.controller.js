import Customer from '../models/Customer.js';
import asyncHandler from '../middleware/asyncHandler.middleware.js';

// Get all customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find();
  res.status(200).json({
    type: 'OK',
    customers: customers
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
    customer: customer
  });
});

// Create a new customer
export const createCustomer = asyncHandler(async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress,
 });

  const newCustomer = await customer.save();
  res.status(201).json({
    type: 'OK',
    message: 'Customer created successfully'
  });
});

// Update a customer by ID
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  res.status(200).json({
    type: 'OK',
    message: 'Customer updated successfully'
  });
});

// Delete a customer by ID
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }
  res.status(200).json({
    type: 'OK',
    message: 'Customer deleted successfully'
  });
});