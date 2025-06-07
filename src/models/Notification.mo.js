import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object, // Can store various types of data related to the notification
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;