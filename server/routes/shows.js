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
    if (!Number.isInteger(Number(totalSeats)) || Number(totalSeats) < 1) {
      return res.status(400).json({ message: 'totalSeats must be a whole number of 1 or more' });
    }

    // Conflict: same theatre can't have two shows at the same date and time
    const clash = await Show.findOne({ theatre, date, time });
    if (clash) {
      return res.status(400).json({
        message: `${theatre} already has a show scheduled at ${time} on ${date}`,
      });
    }

    const show = await Show.create({
      movie, date, time, theatre,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats), // starts full
    });
    res.status(201).json(show);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/shows/:id — admin only
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const existing = await Show.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Show not found' });

    const { totalSeats, theatre, date, time } = req.body;

    // If totalSeats is being changed, keep availableSeats consistent and
    // never let it drop below seats already booked.
    if (totalSeats !== undefined) {
      if (!Number.isInteger(Number(totalSeats)) || Number(totalSeats) < 1) {
        return res.status(400).json({ message: 'totalSeats must be a whole number of 1 or more' });
      }
      const alreadyBooked = existing.totalSeats - existing.availableSeats;
      if (Number(totalSeats) < alreadyBooked) {
        return res.status(400).json({
          message: `Cannot set totalSeats below ${alreadyBooked} — that many seats are already booked`,
        });
      }
      req.body.availableSeats = Number(totalSeats) - alreadyBooked;
    }

    // Conflict check if theatre/date/time are changing
    const newTheatre = theatre ?? existing.theatre;
    const newDate = date ?? existing.date;
    const newTime = time ?? existing.time;
    if (theatre || date || time) {
      const clash = await Show.findOne({
        _id: { $ne: existing._id },
        theatre: newTheatre,
        date: newDate,
        time: newTime,
      });
      if (clash) {
        return res.status(400).json({
          message: `${newTheatre} already has a show scheduled at ${newTime} on ${newDate}`,
        });
      }
    }

    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
