import Notification from '../models/Notification.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get all notifications with filters
export const getNotifications = asyncHandler(async (req, res) => {
  const { 
    id,
    userId,
    type,
    isRead,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (id && mongoose.Types.ObjectId.isValid(id)) filter._id = id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;
  if (type) filter.type = type;
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Notification.countDocuments(filter);

  // Get paginated results
  const notifications = await Notification.find(filter)
    .populate('userId')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { notifications },
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
        userId,
        type,
        isRead,
        startDate,
        endDate
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Get notifications for a specific user
export const getNotificationsForUser = asyncHandler(async (req, res) => {
  const { 
    type,
    isRead,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  // Build filter
  const filter = { userId: req.user.id };
  if (type) filter.type = type;
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Notification.countDocuments(filter);

  // Get paginated results
  const notifications = await Notification.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { notifications },
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
        type,
        isRead,
        startDate,
        endDate
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new notification
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, message, data, isRead = false } = req.body;

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const notification = new Notification({
    userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    type,
    message,
    data,
    isRead
  });

  const savedNotification = await notification.save();
  
  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Notification created successfully',
    data: { notification: savedNotification },
    meta: { id: savedNotification._id }
  });
});

// Update a notification
export const updateNotification = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid notification ID');
  }

  const updates = req.body;
  if (updates.userId && !mongoose.Types.ObjectId.isValid(updates.userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  if (updates.userId) {
    updates.userId = new mongoose.Types.ObjectId(updates.userId);
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  ).populate('userId');

  if (!updatedNotification) {
    throw new ApiError(404, 'Notification not found');
  }

  return responseHandler.success(res, {
    message: 'Notification updated successfully',
    data: { notification: updatedNotification },
    meta: { id: updatedNotification._id }
  });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid notification ID');
  }

  const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
  if (!deletedNotification) {
    throw new ApiError(404, 'Notification not found');
  }

  return responseHandler.success(res, {
    message: 'Notification deleted successfully',
    meta: { id: deletedNotification._id }
  });
});