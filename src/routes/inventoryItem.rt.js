import express from 'express';
const router = express.Router();
import * as inventoryItemController from '../controllers/inventoryItem.ct.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// Get inventory items or a single item by ID
router.get('/', inventoryItemController.getInventoryItems);

// Create a new inventory item
router.post('/', verifyToken, inventoryItemController.createInventoryItem);

// Update an inventory item
router.put('/', verifyToken, inventoryItemController.updateInventoryItem);

// Delete an inventory item
router.delete('/', verifyToken, inventoryItemController.deleteInventoryItem);

export default router;