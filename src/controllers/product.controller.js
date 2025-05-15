import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id).populate('categoryId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    imageUrl,
    stock,
    categoryId,
    sku,
    lowStockThreshold,
    availableSizes,
  } = req.body;

  const newProduct = new Product({
    name,
    description,
    price,
    imageUrl,
    stock,
    categoryId: categoryId ? new mongoose.Types.ObjectId(categoryId) : undefined,
    sku,
    lowStockThreshold,
    availableSizes,
  });

  try {
    const savedProduct = await newProduct.save();
    // Populate after saving to return the category name in the response
    const productWithCategory = await Product.findById(savedProduct._id).populate('categoryId');
    res.status(201).json(productWithCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a product by ID
export const updateProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const updates = req.body;
    // If categoryId is provided, ensure it's a valid ObjectId
    if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }
    if (updates.categoryId) {
        updates.categoryId = new mongoose.Types.ObjectId(updates.categoryId);
    }


    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate('categoryId');

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product by ID
export const deleteProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category ID
export const getProductsByCategoryId = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const products = await Product.find({ categoryId: req.params.categoryId }).populate('categoryId');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};