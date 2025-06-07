import mongoose, { Schema, model } from 'mongoose';

const FaqItemSchema = new Schema(
  {
    question: { type: String, required: true, index: true },
    answer: { type: String, required: true },
    category: { type: String, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

FaqItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const FaqModel = mongoose.models.Faq || model('Faq', FaqItemSchema);

export default FaqModel;