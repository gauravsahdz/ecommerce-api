import InventoryItem from '../models/InventoryItem.js'; // Adjust the path as needed
import asyncHandler from '../middleware/asyncHandler.middleware.js';

// Get all inventory items
export const getAllInventoryItems = asyncHandler(async (req, res) => {
  const inventoryItems = await InventoryItem.find();
  res.status(200).json({
 type: 'OK',
    inventoryItems,
  });
});

// Get a single inventory item by ID
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const inventoryItem = await InventoryItem.findById(req.params.id);
  if (!inventoryItem) {
 return res.status(404).json({ type: 'ERROR', message: 'Inventory item not found' });
  }
  res.status(200).json({
 type: 'OK',
    inventoryItem,
  });
});

// Create a new inventory item
export const createInventoryItem = asyncHandler(async (req, res) => {
  const inventoryItem = new InventoryItem({
    productId: req.body.productId,
    productName: req.body.productName,
    sku: req.body.sku,
    quantity: req.body.quantity,
    location: req.body.location,
    costPrice: req.body.costPrice,
    supplier: req.body.supplier,
    batchNumber: req.body.batchNumber,
    expirationDate: req.body.expirationDate,
    notes: req.body.notes,
  });
  const newInventoryItem = await inventoryItem.save();
  res.status(201).json({
 type: 'OK',
    message: 'Inventory item created successfully',
  });
});

// Update an inventory item by ID
// Update an inventory item by ID
export const updateInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.body.productId != null) {
      inventoryItem.productId = req.body.productId;
    }
    if (req.body.productName != null) {
      inventoryItem.productName = req.body.productName;
    }
    if (req.body.sku != null) {
      inventoryItem.sku = req.body.sku;
    }
    if (req.body.quantity != null) {
      inventoryItem.quantity = req.body.quantity;
    }
    if (req.body.location != null) {
      inventoryItem.location = req.body.location;
    }
    if (req.body.costPrice != null) {
      inventoryItem.costPrice = req.body.costPrice;
    }
    if (req.body.supplier != null) {
      inventoryItem.supplier = req.body.supplier;
    }
    if (req.body.batchNumber != null) {
      inventoryItem.batchNumber = req.body.batchNumber;
    }
    if (req.body.expirationDate != null) {
      inventoryItem.expirationDate = req.body.expirationDate;
    }
    if (req.body.notes != null) {
      inventoryItem.notes = req.body.notes;
    }

    inventoryItem.lastStockUpdatedAt = Date.now(); // Update lastStockUpdatedAt on any update

    const updatedInventoryItem = await inventoryItem.save();
    res.status(200).json({
      type: 'OK',
      message: 'Inventory item updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      type: 'ERROR',
      message: err.message
    });
  }
};

// Delete an inventory item by ID
export const deleteInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await inventoryItem.remove();
    res.status(200).json({
      type: 'OK',
      message: 'Inventory item deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      type: 'ERROR',
      message: err.message
    });
  }
};