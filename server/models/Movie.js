const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  language: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
