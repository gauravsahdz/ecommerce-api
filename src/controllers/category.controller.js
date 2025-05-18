import Category from '../models/Category.js';
import asyncHandler from '../middleware/asyncHandler.middleware.js';

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    type: 'OK',
    categories,
  });
});

// Get a single category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).json({ type: 'ERROR', message: 'Category not found' });
    return;
  }
  res.status(200).json({
    type: 'OK',
    category
  });
});

// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
  const category = new Category({
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
  });
  const newCategory = await category.save();
  res.status(201).json({ type: 'OK', message: 'Category created successfully' });
});

// Update a category by ID
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) {
    res.status(404).json({ type: 'ERROR', message: 'Category not found' });
    return;
  }
  res.status(200).json({ type: 'OK', message: 'Category updated successfully' });
});

// Delete a category by ID
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404).json({ type: 'ERROR', message: 'Category not found' });
    return;
  }
  res.status(200).json({ type: 'OK', message: 'Category deleted successfully' });
});