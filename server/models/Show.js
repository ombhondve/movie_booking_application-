const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  date: { type: String, required: true },   // e.g. "2026-09-10"
  time: { type: String, required: true },   // e.g. "18:30"
  theatre: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  bookedSeatNumbers: { type: [String], default: [] }, // e.g. ['A1', 'A2']
  cancelled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
