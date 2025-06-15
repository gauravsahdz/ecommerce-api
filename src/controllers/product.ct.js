import { Product } from '../models/Product.mo.js';
import mongoose from 'mongoose';
import { ApiResponse, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

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

    return ApiResponse.success(res, 'Product retrieved successfully', { product });
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

  return ApiResponse.paginated(res, 'Products retrieved successfully', { products }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage,
    hasPrevPage,
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
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, sku, categoryId, brandId, compareAtPrice, costPrice, stock, lowStockThreshold, availableSizes, colors, weight, dimensions, tags, status, isFeatured, seo, ratings } = req.body;
    const files = req.files;

    if (!name || !description || !price || !sku || !categoryId) {
      return res.status(400).json({
        type: 'ERROR',
        message: 'Missing required fields: name, description, price, sku, categoryId',
        data: null
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        type: 'ERROR',
        message: 'No image files uploaded',
        data: null
      });
    }

    const compressedImages = await Promise.all(files.map(async (file) => {
      const ext = path.extname(file.filename).toLowerCase();
      const filePath = file.path;
      const compressedPath = filePath.replace(ext, `-compressed${ext}`);

      try {
        await sharp(filePath)
          .resize({ width: 1200 }) // Resize to max width 1200px
          .jpeg({ quality: 70 }) // Compress JPEG quality
          .toFile(compressedPath);

        // Remove the original file
        await fs.promises.unlink(filePath).catch(err => {
          console.warn(`Could not delete original file ${filePath}: ${err.message}`);
        });

        return compressedPath;
      } catch (err) {
        console.error(`Error processing image ${filePath}: ${err.message}`);
        return filePath; // Fallback to original file if compression fails
      }
    }));

    const product = new Product({
      name,
      description,
      price,
      sku,
      categoryId,
      brandId,
      compareAtPrice,
      costPrice,
      stock,
      lowStockThreshold,
      availableSizes,
      colors,
      weight,
      dimensions,
      tags,
      status,
      isFeatured,
      seo,
      ratings,
      imageUrl: compressedImages[0], // Use the first compressed image as the main image
      media: compressedImages.slice(1).map(image => ({
        url: image,
        type: 'image',
        alt: ''
      }))
    });

    await product.save();

    return res.status(201).json({
      type: 'OK',
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      type: 'ERROR',
      message: error.message,
      data: null
    });
  }
};

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

  return ApiResponse.success(res, 'Product updated successfully', { product: updatedProduct });
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

  return ApiResponse.success(res, 'Product deleted successfully');
});