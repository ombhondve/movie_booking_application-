const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['show_cancelled', 'show_rescheduled', 'booking_cancelled'],
      required: true,
    },
    read: { type: Boolean, default: false },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    relatedShow: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);