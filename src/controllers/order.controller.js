import Order from '../models/Order.js';
import { createNotification } from './notification.controller.js';
import asyncHandler from '../middleware/asyncHandler.middleware.js';

// Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  res.status(200).json({
    type: 'OK',
    orders,
  });
});

// Get a single order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.status(200).json({
    type: 'OK',
    order,
  });
});

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
  const { customerInfo, items, totalAmount, status, notes, customerId } =
    req.body;

  const newOrder = new Order({
    customerInfo,
    items,
    totalAmount,
    status,
    notes,
    customerId,
  });

  const savedOrder = await newOrder.save();
  // Assuming createNotification is also updated to not use try-catch internally
  await createNotification({
    recipient: customerId,
    type: 'order_created',
    data: savedOrder,
  });
  res.status(201).json({
    type: 'OK',
    message: 'Order created successfully',
  });
});

// Update an order by ID
export const updateOrder = asyncHandler(async (req, res) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedOrder) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.status(200).json({
    type: 'OK',
    message: 'Order updated successfully',
  });
});

// Delete an order by ID
export const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  if (!deletedOrder) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.status(200).json({
    type: 'OK',
    message: 'Order deleted successfully',
  });
});