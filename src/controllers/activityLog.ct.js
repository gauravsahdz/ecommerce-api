import ActivityLog from '../models/ActivityLog.mo.js';
import User from '../models/User.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get activity logs with filters
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { 
    action,
    entityType,
    entityId,
    details,
    page = 1,
    limit = 200,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = entityId;
  if (details) {
    // Handle nested details query parameters
    Object.keys(details).forEach(key => {
      filter[`details.${key}`] = details[key];
    });
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await ActivityLog.countDocuments(filter);

  // Get paginated results
  const logs = await ActivityLog.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { logs },
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
        action,
        entityType,
        entityId,
        details
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new activity log
export const createActivityLog = asyncHandler(async (req, res) => {
  const { action, entityType, entityId, details } = req.body;

  const log = new ActivityLog({
    action,
    entityType,
    entityId,
    details
  });

  const savedLog = await log.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Activity log created successfully',
    data: { log: savedLog },
    meta: { id: savedLog._id }
  });
}); 