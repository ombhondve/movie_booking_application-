import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings/mine');
        setBookings(res.data);
      } catch (err) {
        setError('Could not load your bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  return (
    <div className="page">
      <h2>My Bookings</h2>
      {loading && <LoadingSpinner label="Loading your bookings..." />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="muted">You haven't booked any tickets yet.</p>
      )}
      <div className="booking-list">
        {bookings.map((b) => (
          <div key={b._id} className="card booking-item">
            <h3>{b.show?.movie?.title}</h3>
            <p className="muted">
              {b.show?.date} | {b.show?.time} | {b.show?.theatre}
            </p>
            <p>Seats booked: {b.seatsBooked}</p>
            <p className={`status status-${b.status}`}>{b.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
