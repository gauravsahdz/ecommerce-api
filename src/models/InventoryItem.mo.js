import mongoose, { Schema } from 'mongoose';

const InventoryItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String }, // Denormalized
    sku: { type: String, index: true }, // Denormalized or specific
    quantity: { type: Number, required: true, default: 0 },
    location: { type: String },
    costPrice: { type: Number },
    supplier: { type: String },
    batchNumber: { type: String },
    expirationDate: { type: Date },
    notes: { type: String },
    lastStockUpdatedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

InventoryItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const InventoryItemModel = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);

export default InventoryItemModel;