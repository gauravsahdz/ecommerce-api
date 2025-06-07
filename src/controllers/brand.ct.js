const Brand = require('../models/Brand.mo');
const { handleError } = require('../utils/error-handler');

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const filter = {};

    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }

    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json({ data: { brands } });
  } catch (error) {
    handleError(res, error);
  }
};

// Get a single brand
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({ data: { message: 'Brand deleted successfully' } });
  } catch (error) {
    handleError(res, error);
  }
};

// Add an order placed
exports.addOrderPlaced = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    brand.orderPlaced.push(req.body);
    await brand.save();

    res.status(201).json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Update order placed status
exports.updateOrderPlacedStatus = async (req, res) => {
  try {
    const { brandId, orderId } = req.params;
    const { status, deliveryDate, notes } = req.body;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const order = brand.orderPlaced.id(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (notes) order.notes = notes;

    await brand.save();
    res.json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Add an out of stock order
exports.addOutOfStockOrder = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    brand.outOfStockOrders.push(req.body);
    await brand.save();

    res.status(201).json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
};

// Update out of stock order status
exports.updateOutOfStockOrderStatus = async (req, res) => {
  try {
    const { brandId, orderId } = req.params;
    const { status, notes } = req.body;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const order = brand.outOfStockOrders.id(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (status === 'submitted') {
      order.submittedAt = new Date();
    }
    if (notes) order.notes = notes;

    await brand.save();
    res.json({ data: { brand } });
  } catch (error) {
    handleError(res, error);
  }
}; 