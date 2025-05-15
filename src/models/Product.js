import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    stock: { type: Number, required: true, default: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    sku: { type: String, index: true },
    lowStockThreshold: { type: Number },
    availableSizes: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for categoryName
ProductSchema.virtual('categoryName').get(function () {
  if (this.populated('categoryId') && (this.categoryId)?.name) {
    return (this.categoryId).name;
  }
  return undefined;
});


const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default ProductModel;