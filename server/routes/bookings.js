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
    const { showId, seatsBooked, seatNumbers } = req.body;

    // Basic input validation
    if (!showId) {
      return res.status(400).json({ message: 'showId is required' });
    }

    // Seat numbers (e.g. ['A1', 'A2']) are what the user actually tapped on
    // the seat map. They're required now so we can track exactly which
    // seats are taken instead of just a count.
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'seatNumbers must be a non-empty array of seat labels' });
    }
    const uniqueSeatNumbers = [...new Set(seatNumbers.map((s) => String(s).trim()))];
    if (uniqueSeatNumbers.length !== seatNumbers.length) {
      return res.status(400).json({ message: 'Duplicate seat numbers in selection' });
    }
    if (uniqueSeatNumbers.length > 20) {
      return res.status(400).json({ message: 'Cannot book more than 20 seats in a single booking' });
    }

    // seatsBooked, if provided, must agree with the seat numbers given —
    // otherwise just derive it from the seat list.
    const seats = seatsBooked !== undefined && seatsBooked !== null
      ? Number(seatsBooked)
      : uniqueSeatNumbers.length;
    if (!Number.isInteger(seats) || seats < 1 || seats !== uniqueSeatNumbers.length) {
      return res.status(400).json({ message: 'seatsBooked must match the number of seat numbers given' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    if (show.cancelled) {
      return res.status(400).json({ message: 'This show has been cancelled by the admin' });
    }

    // Conflict: prevent booking a show whose date/time has already passed
    const showDateTime = new Date(`${show.date}T${show.time}`);
    if (!isNaN(showDateTime.getTime()) && showDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book a show that has already started or ended' });
    }

    // Single atomic conditional update: only succeeds if there's still
    // enough capacity AND none of the requested seat labels are already
    // taken, so two simultaneous bookings can neither oversell seats nor
    // double-book the same seat.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        cancelled: { $ne: true },
        availableSeats: { $gte: seats },
        bookedSeatNumbers: { $nin: uniqueSeatNumbers },
      },
      {
        $inc: { availableSeats: -seats },
        $push: { bookedSeatNumbers: { $each: uniqueSeatNumbers } },
      },
      { new: true }
    );

    if (!updatedShow) {
      // Figure out why, so the user gets a useful message
      const fresh = await Show.findById(showId);
      const clash = fresh?.bookedSeatNumbers?.some((s) => uniqueSeatNumbers.includes(s));
      if (clash) {
        return res.status(400).json({ message: 'One or more selected seats were just booked by someone else. Please pick again.' });
      }
      return res.status(400).json({
        message: `Not enough seats available. Only ${fresh?.availableSeats ?? 0} left.`,
      });
    }

    try {
      const booking = await Booking.create({
        user: req.user.id,
        show: showId,
        seatsBooked: seats,
        seatNumbers: uniqueSeatNumbers,
      });
      return res.status(201).json(booking);
    } catch (err) {
      // Booking record failed to save after seats were already deducted —
      // give the seats back so they aren't lost.
      await Show.findByIdAndUpdate(showId, {
        $inc: { availableSeats: seats },
        $pull: { bookedSeatNumbers: { $in: uniqueSeatNumbers } },
      });
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
    booking.cancelledBy = req.user.role === 'admin' ? 'admin' : 'user';
    await booking.save();
    await Show.findByIdAndUpdate(booking.show, {
      $inc: { availableSeats: booking.seatsBooked },
      $pull: { bookedSeatNumbers: { $in: booking.seatNumbers } },
    });

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
