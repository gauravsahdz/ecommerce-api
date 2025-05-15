// src/routes/categoryRoutes.js
import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
const router = express.Router();

// GET all categories
router.get('/', getAllCategories);

// GET a single category by ID
router.get('/:id', getCategoryById);

// CREATE a new category
router.post('/', createCategory);

// UPDATE a category by ID
router.put('/:id', updateCategory);

// DELETE a category by ID
router.delete('/:id', deleteCategory);

export default router;