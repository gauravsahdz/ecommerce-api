import express from 'express';
const router = express.Router();
import * as productController from '../controllers/product.controller.js';

// GET all products
router.get('/', productController.getAllProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);

// GET products by category ID
router.get('/category/:categoryId', productController.getProductsByCategoryId);

// POST create a new product
router.post('/', productController.createProduct); // Assuming createProduct is the correct function name

// PUT update a product by ID
router.put('/:id', productController.updateProductById);

// DELETE delete a product by ID
router.delete('/:id', productController.deleteProductById);

export default router;