const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['soft', 'hard'],
    required: true
  },
  platform: {
    type: String,
    required: function() {
      return this.type === 'hard';
    },
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
inventorySchema.index({ brandName: 1, sku: 1 });
inventorySchema.index({ type: 1 });
inventorySchema.index({ platform: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory; 