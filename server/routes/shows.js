const express = require('express');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

const router = express.Router();

// GET /api/shows — public, list all (optionally filter by movie)
// Cancelled shows are hidden from the public listing by default so users
// can't book them; pass ?includeCancelled=true (used by the admin panel) to see everything.
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movie = req.query.movieId;
    if (req.query.includeCancelled !== 'true') filter.cancelled = { $ne: true };
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

// PUT /api/shows/:id/cancel — admin only. Cancels the show (keeps the
// record so past bookings still show correct movie/date/time) and marks
// every confirmed booking for it as cancelled so users see it reflected
// on their "My bookings" page instead of it still saying "Confirmed".
router.put('/:id/cancel', authMiddleware, isAdmin, async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    if (show.cancelled) return res.status(400).json({ message: 'Show is already cancelled' });

    show.cancelled = true;
    await show.save();

    const affectedBookings = await Booking.find({ show: show._id, status: 'confirmed' });

    const result = await Booking.updateMany(
      { show: show._id, status: 'confirmed' },
      { $set: { status: 'cancelled', cancelledBy: 'admin' } }
    );

    await Promise.all(
      affectedBookings.map((b) =>
        createNotification({
          user: b.user,
          message: 'Your show has been cancelled by the admin.',
          type: 'show_cancelled',
          relatedBooking: b._id,
          relatedShow: show._id,
        })
      )
    );

    res.json({
      message: 'Show cancelled',
      show,
      bookingsCancelled: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/shows/:id/reschedule — admin only. Changes the date/time of a
// show and flags every confirmed booking for it as rescheduled, recording
// the previous date/time so the user can see what changed.
router.put('/:id/reschedule', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: 'date and time are required to reschedule a show' });
    }

    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    if (show.cancelled) {
      return res.status(400).json({ message: 'Cannot reschedule a cancelled show' });
    }

    const previousDate = show.date;
    const previousTime = show.time;

    if (previousDate === date && previousTime === time) {
      return res.status(400).json({ message: 'New date/time is the same as the current one' });
    }

    // Conflict: same theatre can't have two shows at the same date and time
    const clash = await Show.findOne({
      _id: { $ne: show._id },
      theatre: show.theatre,
      date,
      time,
    });
    if (clash) {
      return res.status(400).json({
        message: `${show.theatre} already has a show scheduled at ${time} on ${date}`,
      });
    }

    show.date = date;
    show.time = time;
    await show.save();

    const affectedBookings = await Booking.find({ show: show._id, status: 'confirmed' });

    const result = await Booking.updateMany(
      { show: show._id, status: 'confirmed' },
      {
        $set: {
          rescheduled: true,
          previousShowDate: previousDate,
          previousShowTime: previousTime,
        },
      }
    );

    await Promise.all(
      affectedBookings.map((b) =>
        createNotification({
          user: b.user,
          message: `Your show has been rescheduled from ${previousDate} ${previousTime} to ${date} ${time}.`,
          type: 'show_rescheduled',
          relatedBooking: b._id,
          relatedShow: show._id,
        })
      )
    );

    res.json({
      message: 'Show rescheduled',
      show,
      bookingsNotified: result.modifiedCount ?? result.nModified ?? 0,
    });
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