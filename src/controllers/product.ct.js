import Product from '../models/Product.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get products with filters or a single product by ID
export const getProducts = asyncHandler(async (req, res) => {
  const { 
    id, 
    name, 
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // If ID is provided, return single product
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return responseHandler.success(res, {
      data: { product }
    });
  }

  // Build filter for list operation
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) filter.categoryId = categoryId;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock !== undefined) filter.inStock = inStock === 'true';

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await Product.countDocuments(filter);

  // Get paginated results
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { products },
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
        categoryId,
        minPrice,
        maxPrice,
        inStock
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId, inStock, sku, lowStockThreshold, availableSizes } = req.body;

  if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  // Process uploaded files
  let imageUrl = null;
  const media = [];
  
  if (req.files && req.files.length > 0) {
    // First file becomes the main image
    const mainFilePath = req.files[0].path;
    // Convert absolute path to relative path for storage
    imageUrl = mainFilePath.split('uploads')[1];
    // Ensure path starts with /
    imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    // Prepend /uploads to make it a proper URL path
    imageUrl = `/uploads${imageUrl}`;
    
    // Additional files become media
    if (req.files.length > 1) {
      for (let i = 1; i < req.files.length; i++) {
        const filePath = req.files[i].path;
        // Convert absolute path to relative path for storage
        let mediaPath = filePath.split('uploads')[1];
        // Ensure path starts with /
        mediaPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
        // Prepend /uploads to make it a proper URL path
        media.push(`/uploads${mediaPath}`);
      }
    }
  }

  // Parse numeric values
  const parsedPrice = parseFloat(price);
  const parsedLowStockThreshold = lowStockThreshold ? parseFloat(lowStockThreshold) : undefined;
  
  // Parse availableSizes if it's an array in form data
  let parsedSizes = [];
  if (availableSizes) {
    if (Array.isArray(availableSizes)) {
      parsedSizes = availableSizes;
    } else {
      parsedSizes = [availableSizes];
    }
  }

  const product = new Product({
    name,
    description,
    price: parsedPrice,
    categoryId,
    imageUrl,
    media,
    stock: parseInt(req.body.stock) || 0,
    inStock: inStock === 'true' || inStock === true,
    sku,
    lowStockThreshold: parsedLowStockThreshold,
    availableSizes: parsedSizes
  });

  const savedProduct = await product.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Product created successfully',
    data: { product: savedProduct },
    meta: { id: savedProduct._id }
  });
});

// Update a product
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  const updates = { ...req.body };
  
  // Handle file uploads if present
  if (req.files && req.files.length > 0) {
    // First file becomes the main image
    const mainFilePath = req.files[0].path;
    // Convert absolute path to relative path for storage
    let imageUrl = mainFilePath.split('uploads')[1];
    // Ensure path starts with /
    imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    // Prepend /uploads to make it a proper URL path
    updates.imageUrl = `/uploads${imageUrl}`;
    
    // Additional files become media
    if (req.files.length > 1) {
      updates.media = [];
      for (let i = 1; i < req.files.length; i++) {
        const filePath = req.files[i].path;
        // Convert absolute path to relative path for storage
        let mediaPath = filePath.split('uploads')[1];
        // Ensure path starts with /
        mediaPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
        // Prepend /uploads to make it a proper URL path
        updates.media.push(`/uploads${mediaPath}`);
      }
    }
  }

  if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
    throw new ApiError(400, 'Invalid category ID');
  }

  // Parse numeric values if they exist in the updates
  if (updates.price) updates.price = parseFloat(updates.price);
  if (updates.stock) updates.stock = parseInt(updates.stock);
  if (updates.lowStockThreshold) updates.lowStockThreshold = parseFloat(updates.lowStockThreshold);
  
  // Parse availableSizes if it's an array in form data
  if (updates.availableSizes) {
    if (Array.isArray(updates.availableSizes)) {
      // Keep as is if it's already an array
    } else {
      updates.availableSizes = [updates.availableSizes];
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );

  if (!updatedProduct) {
    throw new ApiError(404, 'Product not found');
  }

  return responseHandler.success(res, {
    message: 'Product updated successfully',
    data: { product: updatedProduct },
    meta: { id: updatedProduct._id }
  });
});

// Delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) {
    throw new ApiError(404, 'Product not found');
  }

  return responseHandler.success(res, {
    message: 'Product deleted successfully',
    meta: { id: deletedProduct._id }
  });
});