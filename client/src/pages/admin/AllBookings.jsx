import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/all')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>All Bookings</h3>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr><th>User</th><th>Movie</th><th>Show</th><th>Seats</th><th>Status</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.user?.name} ({b.user?.email})</td>
              <td>{b.show?.movie?.title || '—'}</td>
              <td>{b.show?.theatre} · {b.show?.date} {b.show?.time}</td>
              <td>{b.seatsBooked}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
