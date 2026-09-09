const Booking = require('./models/Booking');
const { generateBookingId } = require('./utils/notify');

module.exports = async function backfillBookingIds() {
  const missing = await Booking.find({ bookingId: { $in: [null, undefined] } }).sort({ bookingDate: 1 });
  for (const booking of missing) {
    booking.bookingId = await generateBookingId(booking.bookingDate || new Date());
    await booking.save();
  }
  if (missing.length > 0) {
    console.log(`Backfilled bookingId for ${missing.length} existing booking(s).`);
  }
};