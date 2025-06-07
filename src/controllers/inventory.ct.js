const Inventory = require('../models/Inventory.mo');
const { handleError } = require('../utils/error-handler');

// Get all inventory items with filtering
exports.getInventoryItems = async (req, res) => {
  try {
    const { type, brandName, platform, searchTerm } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (brandName) filter.brandName = { $regex: brandName, $options: 'i' };
    if (platform) filter.platform = { $regex: platform, $options: 'i' };
    if (searchTerm) {
      filter.$or = [
        { brandName: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { platform: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json({ data: { items } });
  } catch (error) {
    handleError(res, error);
  }
};

// Get a single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ data: { item } });
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ data: { item } });
  } catch (error) {
    handleError(res, error);
  }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ data: { item } });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ data: { message: 'Inventory item deleted successfully' } });
  } catch (error) {
    handleError(res, error);
  }
};

// Get inventory summary
exports.getInventorySummary = async (req, res) => {
  try {
    const [softInventory, hardInventory] = await Promise.all([
      Inventory.aggregate([
        { $match: { type: 'soft' } },
        { $group: { _id: null, totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
      ]),
      Inventory.aggregate([
        { $match: { type: 'hard' } },
        { $group: { _id: null, totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
      ])
    ]);

    res.json({
      data: {
        summary: {
          soft: {
            totalItems: softInventory[0]?.totalItems || 0,
            totalQuantity: softInventory[0]?.totalQuantity || 0
          },
          hard: {
            totalItems: hardInventory[0]?.totalItems || 0,
            totalQuantity: hardInventory[0]?.totalQuantity || 0
          }
        }
      }
    });
  } catch (error) {
    handleError(res, error);
  }
}; 