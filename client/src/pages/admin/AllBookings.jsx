import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings/all');
        setBookings(res.data);
      } catch (err) {
        setError('Could not load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
  }, []);

  return (
    <div>
      <h3>All Bookings</h3>
      {loading && <LoadingSpinner label="Loading bookings..." />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="muted">No bookings have been made yet.</p>
      )}
      {bookings.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Movie</th>
              <th>Show</th>
              <th>Seats</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>
                  {b.user?.name}
                  <div className="muted">{b.user?.email}</div>
                </td>
                <td>{b.show?.movie?.title}</td>
                <td>
                  {b.show?.date} {b.show?.time} | {b.show?.theatre}
                </td>
                <td>{b.seatsBooked}</td>
                <td className={`status status-${b.status}`}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
