const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — logged-in user books seats
router.post('/', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { showId, seatsBooked } = req.body;

    if (!showId || !seatsBooked || seatsBooked < 1) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'showId and a valid seatsBooked count are required' });
    }

    const show = await Show.findById(showId).session(session);
    if (!show) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Show not found' });
    }

    if (show.availableSeats < seatsBooked) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Not enough seats available. Only ${show.availableSeats} left.`,
      });
    }

    show.availableSeats -= seatsBooked;
    await show.save({ session });

    const booking = await Booking.create([{
      user: req.user.id,
      show: showId,
      seatsBooked,
    }], { session });

    await session.commitTransaction();
    res.status(201).json(booking[0]);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    session.endSession();
  }
});

// GET /api/bookings/mine — logged-in user's own bookings
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({ path: 'show', populate: { path: 'movie' } })
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/bookings/all — admin only, all bookings
router.get('/all', authMiddleware, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'show', populate: { path: 'movie' } })
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
