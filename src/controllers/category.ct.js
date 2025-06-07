import Category from '../models/Category.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get all categories with filters
export const getCategories = asyncHandler(async (req, res) => {
  const { 
    id, 
    name, 
    parentId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  if (id && mongoose.Types.ObjectId.isValid(id)) filter._id = id;
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (parentId && mongoose.Types.ObjectId.isValid(parentId)) filter.parentId = parentId;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Category.countDocuments(filter);

  // Get paginated results
  const categories = await Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { categories },
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
        parentId
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Get a single category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  return responseHandler.success(res, {
    data: { category }
  });
});

// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentId, slug } = req.body;

  if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
    throw new ApiError(400, 'Invalid parent category ID');
  }
  
  // Get the file path from the uploaded file
  let imageUrl = null;
  // In createCategory function
  if (req.files && req.files.length > 0) {
    // Use the compressed file path
    const filePath = req.files[0].path;
    // Convert absolute path to relative path for storage and replace backslashes with forward slashes
    imageUrl = filePath.split('uploads')[1].replace(/\\/g, '/');
    // Ensure path starts with /
    imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    // Prepend /uploads to make it a proper URL path
    imageUrl = `/uploads${imageUrl}`;
  }
  
  const category = new Category({
    name,
    description,
    parentId,
    imageUrl,
    slug
  });

  const savedCategory = await category.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data: savedCategory,
    meta: { id: savedCategory._id }
  });
});

// Update a category
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  const updates = { ...req.body };
  
  // Handle file upload if present
  // In updateCategory function
  if (req.files && req.files.length > 0) {
  // Use the compressed file path
  const filePath = req.files[0].path;
  // Convert absolute path to relative path for storage and replace backslashes with forward slashes
  let imageUrl = filePath.split('uploads')[1].replace(/\\/g, '/');
  // Ensure path starts with /
  imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  // Prepend /uploads to make it a proper URL path
  updates.imageUrl = `/uploads${imageUrl}`;
  }

  if (updates.parentId && !mongoose.Types.ObjectId.isValid(updates.parentId)) {
    throw new ApiError(400, 'Invalid parent category ID');
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );

  if (!updatedCategory) {
    throw new ApiError(404, 'Category not found');
  }

  return responseHandler.success(res, {
    message: 'Category updated successfully',
    data: updatedCategory,
    meta: { id: updatedCategory._id }
  });
});

// Delete a category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    throw new ApiError(404, 'Category not found');
  }

  return responseHandler.success(res, {
    message: 'Category deleted successfully',
    meta: { id: deletedCategory._id }
  });
});