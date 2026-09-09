const express = require('express');
const Movie = require('../models/Movie');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/movies — public, list all
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/movies/:id — public, single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/movies — admin only
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, genre, duration, language, description } = req.body;
    if (!title || !genre || !duration || !language) {
      return res.status(400).json({ message: 'title, genre, duration, and language are required' });
    }
    const movie = await Movie.create({ title, genre, duration, language, description });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/movies/:id — admin only
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/movies/:id — admin only
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
