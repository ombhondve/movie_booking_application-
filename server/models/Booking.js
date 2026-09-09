const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seatsBooked: { type: Number, required: true },
  seatNumbers: { type: [String], default: [] },
  bookingDate: { type: Date, default: Date.now },
  bookingId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  cancelledBy: { type: String, enum: ['user', 'admin', null], default: null },
  rescheduled: { type: Boolean, default: false },
  previousShowDate: { type: String, default: null },
  previousShowTime: { type: String, default: null },
});

module.exports = mongoose.model('Booking', bookingSchema);