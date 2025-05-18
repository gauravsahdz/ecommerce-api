import express from 'express';
const router = express.Router(); // Keep const router = express.Router();
import * as inventoryItemController from '../controllers/inventoryItem.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// Get all inventory items
router.get('/', inventoryItemController.getAllInventoryItems);

// Get a single inventory item by ID
router.get('/:id', inventoryItemController.getInventoryItemById);

// Create a new inventory item
router.post('/', inventoryItemController.createInventoryItem);

// Update an inventory item by ID
router.put('/:id', verifyToken, inventoryItemController.updateInventoryItemById);

// Delete an inventory item by ID
router.delete('/:id', verifyToken, inventoryItemController.deleteInventoryItemById);

export default router;