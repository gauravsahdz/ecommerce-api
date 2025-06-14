import { Order } from '../models/Order.mo.js';
import { createNotificationInternal } from './notification.ct.js';
import { ApiResponse, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';
import mongoose from 'mongoose';

// Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Order.countDocuments();

  // Get paginated results
  const orders = await Order.find()
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return ApiResponse.paginated(res, 'Orders retrieved successfully', { orders }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage,
    hasPrevPage,
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Get a single order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  return ApiResponse.success(res, 'Order retrieved successfully', { order });
});

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
  const { customerInfo, items, totalAmount, status, notes, customerId } = req.body;

  let media = [];
  if (req.files && req.files.length > 0) {
    media = req.files.map(file => file.path.replace(/\\/g, '/'));
  }

  const newOrder = new Order({
    customerInfo,
    items,
    totalAmount,
    status,
    notes,
    customerId,
    media,
  });

  const savedOrder = await newOrder.save();

  try {
    // Notify the customer about the order creation
    if (customerId) {
      await createNotificationInternal(
        customerId,
        'Order Placed Successfully',
        'Your order has been placed successfully',
        'order',
        {
          orderId: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          totalAmount: savedOrder.totalAmount
        }
      );
    }

    // Notify the admin about the new order
    const adminId = '68270a2441ba4976a90722a1'; // Replace with actual admin ID or fetch from database
    await createNotificationInternal(
      adminId,
      'New Order Received',
      'A new order has been placed',
      'order',
      {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        customerInfo: savedOrder.customerInfo
      }
    );
  } catch (error) {
    console.error('Error creating notifications:', error);
    // Continue with order creation even if notifications fail
  }

  return ApiResponse.success(res, 'Order created successfully', { 
    order: savedOrder,
    notifications: {
      sent: ['customer', 'admin']
    }
  }, 201);
});

// Update an order by ID
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order ID');
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updatedOrder) {
    throw new ApiError(404, 'Order not found');
  }

  return ApiResponse.success(res, 'Order updated successfully', { order: updatedOrder });
});

// Delete an order by ID
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid order ID');
  }

  const deletedOrder = await Order.findByIdAndDelete(id);
  if (!deletedOrder) {
    throw new ApiError(404, 'Order not found');
  }

  return ApiResponse.success(res, 'Order deleted successfully');
});

// Get today's orders
export const getTodayOrders = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter = {
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  };

  const orders = await Order.find(filter)
    .populate('customerId')
    .populate('items.productId')
    .sort({ createdAt: -1 });

  const total = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return ApiResponse.success(res, 'Today\'s orders retrieved successfully', {
    orders,
    summary: {
      total,
      totalAmount
    }
  });
});

// Get order summary
export const getOrderSummary = asyncHandler(async (req, res) => {
  const summary = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  return ApiResponse.success(res, 'Order summary retrieved successfully', {
    summary: {
      total: summary[0]?.total || 0,
      totalAmount: summary[0]?.totalAmount || 0
    }
  });
});