const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — logged-in user books seats
//
// Note: this uses a single atomic conditional update (findOneAndUpdate with
// a query filter + $inc) instead of a multi-document transaction. Real
// MongoDB transactions require a replica set / sharded cluster — they throw
// "Transaction numbers are only allowed on a replica set member or mongos"
// on a plain standalone `mongod`, which is how most people run MongoDB
// locally. The filter below (`availableSeats: { $gte: seatsBooked }`) makes
// the seat-check-and-decrement a single atomic operation on the database
// side, so two simultaneous bookings still can't oversell seats — without
// needing a replica set.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { showId, seatsBooked } = req.body;

    if (!showId || !seatsBooked || seatsBooked < 1) {
      return res.status(400).json({ message: 'showId and a valid seatsBooked count are required' });
    }

    const updatedShow = await Show.findOneAndUpdate(
      { _id: showId, availableSeats: { $gte: seatsBooked } },
      { $inc: { availableSeats: -seatsBooked } },
      { new: true }
    );

    if (!updatedShow) {
      // Either the show doesn't exist, or it exists but didn't have enough seats.
      const show = await Show.findById(showId);
      if (!show) {
        return res.status(404).json({ message: 'Show not found' });
      }
      return res.status(400).json({
        message: `Not enough seats available. Only ${show.availableSeats} left.`,
      });
    }

    try {
      const booking = await Booking.create({
        user: req.user.id,
        show: showId,
        seatsBooked,
      });
      return res.status(201).json(booking);
    } catch (err) {
      // Booking record failed to save after seats were already deducted —
      // give the seats back so they aren't lost.
      await Show.findByIdAndUpdate(showId, { $inc: { availableSeats: seatsBooked } });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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