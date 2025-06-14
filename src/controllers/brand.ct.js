import { Brand } from '../models/Brand.mo.js';
import { ApiResponse } from '../utils/responseHandler.ut.js';

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const filter = {};

    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }

    const brands = await Brand.find(filter).sort({ name: 1 });
    return ApiResponse.success(res, 'Brands retrieved successfully', { brands });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to retrieve brands');
  }
};

// Get a single brand
export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }
    return ApiResponse.success(res, 'Brand retrieved successfully', { brand });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to retrieve brand');
  }
};

// Create a new brand
export const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    return ApiResponse.success(res, 'Brand created successfully', { brand }, 201);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to create brand');
  }
};

// Update a brand
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }
    return ApiResponse.success(res, 'Brand updated successfully', { brand });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to update brand');
  }
};

// Delete a brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }
    return ApiResponse.success(res, 'Brand deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to delete brand');
  }
};

// Add an order placed
export const addOrderPlaced = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }

    brand.orderPlaced.push(req.body);
    await brand.save();

    return ApiResponse.success(res, 'Order added successfully', { brand }, 201);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to add order');
  }
};

// Update order placed status
export const updateOrderPlacedStatus = async (req, res) => {
  try {
    const { brandId, orderId } = req.params;
    const { status, deliveryDate, notes } = req.body;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }

    const order = brand.orderPlaced.id(orderId);
    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    order.status = status;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (notes) order.notes = notes;

    await brand.save();
    return ApiResponse.success(res, 'Order status updated successfully', { brand });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to update order status');
  }
};

// Add an out of stock order
export const addOutOfStockOrder = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }

    brand.outOfStockOrders.push(req.body);
    await brand.save();

    return ApiResponse.success(res, 'Out of stock order added successfully', { brand }, 201);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to add out of stock order');
  }
};

// Update out of stock order status
export const updateOutOfStockOrderStatus = async (req, res) => {
  try {
    const { brandId, orderId } = req.params;
    const { status, notes } = req.body;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return ApiResponse.notFound(res, 'Brand not found');
    }

    const order = brand.outOfStockOrders.id(orderId);
    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    order.status = status;
    if (status === 'submitted') {
      order.submittedAt = new Date();
    }
    if (notes) order.notes = notes;

    await brand.save();
    return ApiResponse.success(res, 'Out of stock order status updated successfully', { brand });
  } catch (error) {
    return ApiResponse.error(res, 'Failed to update out of stock order status');
  }
}; 