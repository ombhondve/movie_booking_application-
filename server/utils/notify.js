const Notification = require('../models/Notification');
const Booking = require('../models/Booking');

async function generateBookingId(date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `RB-${datePart}-`;
  const count = await Booking.countDocuments({ bookingId: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

async function createNotification({ user, message, type, relatedBooking = null, relatedShow = null }) {
  try {
    await Notification.create({ user, message, type, relatedBooking, relatedShow });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = { generateBookingId, createNotification };