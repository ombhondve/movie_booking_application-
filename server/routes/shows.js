const express = require('express');
const Show = require('../models/Show');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/shows — public, list all (optionally filter by movie)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movie = req.query.movieId;
    const shows = await Show.find(filter).populate('movie');
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/shows/:id — public, single show
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movie');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/shows — admin only
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { movie, date, time, theatre, totalSeats } = req.body;
    if (!movie || !date || !time || !theatre || !totalSeats) {
      return res.status(400).json({ message: 'movie, date, time, theatre, and totalSeats are required' });
    }
    const show = await Show.create({
      movie, date, time, theatre,
      totalSeats,
      availableSeats: totalSeats, // starts full
    });
    res.status(201).json(show);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/shows/:id — admin only
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/shows/:id — admin only
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json({ message: 'Show deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
