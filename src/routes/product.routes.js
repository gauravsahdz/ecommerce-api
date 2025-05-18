import express from 'express';
const router = express.Router();
import * as productController from '../controllers/product.controller.js';

import { verifyToken } from '../middleware/auth.middleware.js';
// GET all products
router.get('/', productController.getAllProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);

// GET products by category ID
router.get('/category/:categoryId', productController.getProductsByCategoryId);

// POST create a new product
router.post('/', productController.createProduct); // Assuming createProduct is the correct function name

// PUT update a product by ID\nrouter.put(\'/:id\', verifyToken, productController.updateProductById);

// DELETE delete a product by ID\nrouter.delete(\'/:id\', verifyToken, productController.deleteProductById);

export default router;