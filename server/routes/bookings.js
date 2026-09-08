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

    // Basic input validation
    if (!showId) {
      return res.status(400).json({ message: 'showId is required' });
    }
    if (
      seatsBooked === undefined ||
      seatsBooked === null ||
      !Number.isInteger(Number(seatsBooked)) ||
      Number(seatsBooked) < 1
    ) {
      return res.status(400).json({ message: 'seatsBooked must be a whole number of 1 or more' });
    }
    const seats = Number(seatsBooked);
    if (seats > 20) {
      return res.status(400).json({ message: 'Cannot book more than 20 seats in a single booking' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Conflict: prevent booking a show whose date/time has already passed
    const showDateTime = new Date(`${show.date}T${show.time}`);
    if (!isNaN(showDateTime.getTime()) && showDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book a show that has already started or ended' });
    }

    const updatedShow = await Show.findOneAndUpdate(
      { _id: showId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true }
    );

    if (!updatedShow) {
      // availableSeats dropped below what's needed between our read and this update
      return res.status(400).json({
        message: `Not enough seats available. Only ${show.availableSeats} left.`,
      });
    }

    try {
      const booking = await Booking.create({
        user: req.user.id,
        show: showId,
        seatsBooked: seats,
      });
      return res.status(201).json(booking);
    } catch (err) {
      // Booking record failed to save after seats were already deducted —
      // give the seats back so they aren't lost.
      await Show.findByIdAndUpdate(showId, { $inc: { availableSeats: seats } });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/bookings/:id — user cancels their own booking, seats are returned
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();
    await Show.findByIdAndUpdate(booking.show, { $inc: { availableSeats: booking.seatsBooked } });

    res.json({ message: 'Booking cancelled', booking });
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
