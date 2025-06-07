import Order from '../models/Order.mo.js';
import { createNotification } from './notification.ct.js';
import asyncHandler from '../middleware/asyncHandler.mw.js';

// Get all orders
export const getOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    customerId,
    startDate,
    endDate
  } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Order.countDocuments(filter);

  // Get paginated results
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    type: 'OK',
    data: {
      orders
    },
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
      filters: {
        applied: Object.keys(filter).length > 0 ? filter : null,
        available: {
          status,
          customerId,
          startDate,
          endDate
        }
      },
      sort: {
        by: sortBy,
        order: sortOrder
      }
    }
  });
});

// Get a single order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ 
      type: 'ERROR', 
      message: 'Order not found',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
  res.status(200).json({
    type: 'OK',
    data: {
      order
    },
    meta: {
      timestamp: new Date().toISOString(),
      id: order._id
    }
  });
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

  // Notify the customer about the order creation
  await createNotification({
    recipient: customerId,
    type: 'order_created',
    data: savedOrder,
  });
  // Notify the admin about the new order
  await createNotification({
    recipient: 'admin',
    type: 'new_order',
    data: savedOrder,
  });
  res.status(201).json({
    type: 'OK',
    message: 'Order created successfully',
    data: {
      order: savedOrder
    },
    meta: {
      timestamp: new Date().toISOString(),
      id: savedOrder._id,
      notifications: {
        sent: ['customer', 'admin']
      }
    }
  });
});

// Update an order by ID
export const updateOrder = asyncHandler(async (req, res) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedOrder) {
    return res.status(404).json({ 
      type: 'ERROR', 
      message: 'Order not found',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
  res.status(200).json({
    type: 'OK',
    message: 'Order updated successfully',
    data: {
      order: updatedOrder
    },
    meta: {
      timestamp: new Date().toISOString(),
      id: updatedOrder._id
    }
  });
});

// Delete an order by ID
export const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  if (!deletedOrder) {
    return res.status(404).json({ 
      type: 'ERROR', 
      message: 'Order not found',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
  res.status(200).json({
    type: 'OK',
    message: 'Order deleted successfully',
    meta: {
      timestamp: new Date().toISOString(),
      id: deletedOrder._id
    }
  });
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

  return responseHandler.success(res, {
    data: {
      orders,
      summary: {
        total,
        totalAmount
      }
    }
  });
});