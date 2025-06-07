import DiscountCode from '../models/DiscountCode.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get all discount codes with filters
export const getDiscountCodes = asyncHandler(async (req, res) => {
  const { 
    id, 
    code, 
    type, 
    isActive, 
    appliesTo, 
    productId, 
    categoryId, 
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
  if (code) filter.code = { $regex: code, $options: 'i' };
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (appliesTo) filter.appliesTo = appliesTo;
  if (productId && mongoose.Types.ObjectId.isValid(productId)) filter.productIds = productId;
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) filter.categoryIds = categoryId;
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate);
    if (endDate) filter.startDate.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await DiscountCode.countDocuments(filter);

  // Get paginated results
  const discountCodes = await DiscountCode.find(filter)
    .populate('productIds')
    .populate('categoryIds')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { discountCodes },
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
        code,
        type,
        isActive,
        appliesTo,
        productId,
        categoryId,
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

// Create a new discount code
export const createDiscountCode = asyncHandler(async (req, res) => {
  const { 
    code, 
    type, 
    value, 
    isActive, 
    appliesTo, 
    productIds, 
    categoryIds, 
    startDate, 
    endDate, 
    usageLimit, 
    minOrderValue 
  } = req.body;

  // Validate ObjectIds if provided
  if (productIds) {
    if (!Array.isArray(productIds)) {
      throw new ApiError(400, 'Product IDs must be an array');
    }
    for (const id of productIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid product ID: ${id}`);
      }
    }
  }

  if (categoryIds) {
    if (!Array.isArray(categoryIds)) {
      throw new ApiError(400, 'Category IDs must be an array');
    }
    for (const id of categoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid category ID: ${id}`);
      }
    }
  }

  const newDiscountCode = new DiscountCode({
    code,
    type,
    value,
    isActive,
    appliesTo,
    productIds: productIds?.map(id => new mongoose.Types.ObjectId(id)),
    categoryIds: categoryIds?.map(id => new mongoose.Types.ObjectId(id)),
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    usageLimit,
    minOrderValue
  });

  const savedDiscountCode = await newDiscountCode.save();
  
  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Discount code created successfully',
    data: { discountCode: savedDiscountCode },
    meta: { id: savedDiscountCode._id }
  });
});

// Update a discount code
export const updateDiscountCode = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid discount code ID');
  }

  const updates = req.body;

  // Validate ObjectIds if provided
  if (updates.productIds) {
    if (!Array.isArray(updates.productIds)) {
      throw new ApiError(400, 'Product IDs must be an array');
    }
    for (const id of updates.productIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid product ID: ${id}`);
      }
    }
    updates.productIds = updates.productIds.map(id => new mongoose.Types.ObjectId(id));
  }

  if (updates.categoryIds) {
    if (!Array.isArray(updates.categoryIds)) {
      throw new ApiError(400, 'Category IDs must be an array');
    }
    for (const id of updates.categoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid category ID: ${id}`);
      }
    }
    updates.categoryIds = updates.categoryIds.map(id => new mongoose.Types.ObjectId(id));
  }

  // Convert dates if provided
  if (updates.startDate) updates.startDate = new Date(updates.startDate);
  if (updates.endDate) updates.endDate = new Date(updates.endDate);

  const updatedDiscountCode = await DiscountCode.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  ).populate('productIds')
   .populate('categoryIds');

  if (!updatedDiscountCode) {
    throw new ApiError(404, 'Discount code not found');
  }

  return responseHandler.success(res, {
    message: 'Discount code updated successfully',
    data: { discountCode: updatedDiscountCode },
    meta: { id: updatedDiscountCode._id }
  });
});

// Delete a discount code
export const deleteDiscountCode = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid discount code ID');
  }

  const deletedDiscountCode = await DiscountCode.findByIdAndDelete(req.params.id);
  if (!deletedDiscountCode) {
    throw new ApiError(404, 'Discount code not found');
  }

  return responseHandler.success(res, {
    message: 'Discount code deleted successfully',
    meta: { id: deletedDiscountCode._id }
  });
}); 