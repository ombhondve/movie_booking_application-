import { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/mine')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Failed to load your bookings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container">
      <h2>My Bookings</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && !error && <p>You haven't booked anything yet.</p>}
      {bookings.map((b) => (
        <div className="card" key={b._id}>
          <p><strong>{b.show?.movie?.title || 'Movie'}</strong></p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            {b.show?.theatre} · {b.show?.date} {b.show?.time}
          </p>
          <p style={{ fontSize: 14 }}>Seats booked: {b.seatsBooked} · Status: {b.status}</p>
        </div>
      ))}
    </div>
  );
}
