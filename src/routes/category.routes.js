// src/routes/categoryRoutes.js
import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();

// GET all categories
router.get('/', getAllCategories);

// GET a single category by ID
router.get('/:id', getCategoryById);

// CREATE a new category
router.post('/', createCategory);

// UPDATE a category by ID
router.put('/:id', verifyToken, updateCategory);

// DELETE a category by ID
router.delete('/:id', verifyToken, deleteCategory);

export default router;