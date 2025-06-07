const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.ct');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get inventory summary
router.get('/summary', inventoryController.getInventorySummary);

// Get all inventory items
router.get('/', inventoryController.getInventoryItems);

// Get a single inventory item
router.get('/:id', inventoryController.getInventoryItem);

// Create a new inventory item
router.post('/', inventoryController.createInventoryItem);

// Update an inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router; 