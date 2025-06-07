// src/models/Customer.js
import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    shippingAddress: { type: String, required: true },
    billingAddress: { type: String },
    // orderHistoryIds could be added here if needed, as an array of Order ObjectIds
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CustomerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export default CustomerModel;