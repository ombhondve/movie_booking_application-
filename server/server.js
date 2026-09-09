require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

const createAdmin = require('./createAdmin');
const backfillBookingIds = require('./backfillBookingIds');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Movie Booking API is running');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    console.log('Database:', mongoose.connection.name);

    await createAdmin();
    await backfillBookingIds();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });