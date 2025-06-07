import mongoose, { Schema } from 'mongoose';

const USER_ROLES = ["Admin", "Editor", "Viewer"];

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: USER_ROLES, required: true, default: "Viewer" },
    avatarUrl: { type: String },
    lastLogin: { type: Date },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;