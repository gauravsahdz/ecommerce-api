import InventoryItem from '../models/InventoryItem.mo.js';
import mongoose from 'mongoose';
import { responseHandler, asyncHandler, ApiError } from '../utils/responseHandler.ut.js';

// Get inventory items with filters or a single item by ID
export const getInventoryItems = asyncHandler(async (req, res) => {
  const { 
    inventory_id,
    productId,
    warehouseId,
    status,
    minQuantity,
    maxQuantity,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // If inventory_id is provided, return single item
  if (inventory_id) {
    if (!mongoose.Types.ObjectId.isValid(inventory_id)) {
      throw new ApiError(400, 'Invalid inventory item ID');
    }

    const inventoryItem = await InventoryItem.findById(inventory_id);
    if (!inventoryItem) {
      throw new ApiError(404, 'Inventory item not found');
    }

    return responseHandler.success(res, {
      data: { inventoryItem }
    });
  }

  // Build filter for list operation
  const filter = {};
  if (productId && mongoose.Types.ObjectId.isValid(productId)) filter.productId = productId;
  if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) filter.warehouseId = warehouseId;
  if (status) filter.status = status;
  if (minQuantity || maxQuantity) {
    filter.quantity = {};
    if (minQuantity) filter.quantity.$gte = Number(minQuantity);
    if (maxQuantity) filter.quantity.$lte = Number(maxQuantity);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Get total count
  const total = await InventoryItem.countDocuments(filter);

  // Get paginated results
  const inventoryItems = await InventoryItem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate metadata
  const totalPages = Math.ceil(total / Number(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return responseHandler.list(res, {
    data: { inventoryItems },
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
        inventory_id,
        productId,
        warehouseId,
        status,
        minQuantity,
        maxQuantity
      }
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });
});

// Create a new inventory item
export const createInventoryItem = asyncHandler(async (req, res) => {
  const { productId, warehouseId, quantity, status, location } = req.body;

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid product ID');
  }
  if (warehouseId && !mongoose.Types.ObjectId.isValid(warehouseId)) {
    throw new ApiError(400, 'Invalid warehouse ID');
  }

  const inventoryItem = new InventoryItem({
    productId,
    warehouseId,
    quantity,
    status,
    location
  });

  const savedInventoryItem = await inventoryItem.save();

  return responseHandler.success(res, {
    statusCode: 201,
    message: 'Inventory item created successfully',
    data: { inventoryItem: savedInventoryItem },
    meta: { id: savedInventoryItem._id }
  });
});

// Update an inventory item
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { inventory_id } = req.query;
  
  if (!inventory_id || !mongoose.Types.ObjectId.isValid(inventory_id)) {
    throw new ApiError(400, 'Invalid inventory item ID');
  }

  const updates = req.body;
  if (updates.productId && !mongoose.Types.ObjectId.isValid(updates.productId)) {
    throw new ApiError(400, 'Invalid product ID');
  }
  if (updates.warehouseId && !mongoose.Types.ObjectId.isValid(updates.warehouseId)) {
    throw new ApiError(400, 'Invalid warehouse ID');
  }

  const updatedInventoryItem = await InventoryItem.findByIdAndUpdate(
    inventory_id,
    updates,
    { new: true }
  );

  if (!updatedInventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  return responseHandler.success(res, {
    message: 'Inventory item updated successfully',
    data: { inventoryItem: updatedInventoryItem },
    meta: { id: updatedInventoryItem._id }
  });
});

// Delete an inventory item
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { inventory_id } = req.query;
  
  if (!inventory_id || !mongoose.Types.ObjectId.isValid(inventory_id)) {
    throw new ApiError(400, 'Invalid inventory item ID');
  }

  const deletedInventoryItem = await InventoryItem.findByIdAndDelete(inventory_id);
  if (!deletedInventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  return responseHandler.success(res, {
    message: 'Inventory item deleted successfully',
    meta: { id: deletedInventoryItem._id }
  });
});