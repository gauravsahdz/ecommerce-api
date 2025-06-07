// src/models/Category.js
import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    imageUrl: { type: String },
    media: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CategorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default CategoryModel;