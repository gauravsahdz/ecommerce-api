const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.ct');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Brand CRUD operations
router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrand);
router.post('/', brandController.createBrand);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

// Order placed management
router.post('/:id/orders', brandController.addOrderPlaced);
router.put('/:brandId/orders/:orderId', brandController.updateOrderPlacedStatus);

// Out of stock orders management
router.post('/:id/out-of-stock', brandController.addOutOfStockOrder);
router.put('/:brandId/out-of-stock/:orderId', brandController.updateOutOfStockOrderStatus);

module.exports = router; 