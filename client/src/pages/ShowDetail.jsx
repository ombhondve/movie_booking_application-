import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ShowDetail() {
  const { id } = useParams(); // movie id
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/shows?movieId=${id}`),
    ])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data);
        setShows(showsRes.data);
      })
      .catch(() => setError('Failed to load show details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    setError('');
    setSuccess('');

    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedShow) {
      setError('Select a show first');
      return;
    }

    setBooking(true);
    try {
      await api.post('/bookings', { showId: selectedShow._id, seatsBooked: Number(seats) });
      setSuccess('Booking confirmed!');
      // refresh show list to reflect updated seat count
      const res = await api.get(`/shows?movieId=${id}`);
      setShows(res.data);
      setSelectedShow(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) return <div className="container"><p className="error">{error || 'Movie not found'}</p></div>;

  return (
    <div className="container">
      <h2>{movie.title}</h2>
      <p style={{ opacity: 0.7 }}>{movie.genre} · {movie.language} · {movie.duration} min</p>
      <p>{movie.description}</p>

      <h3>Shows</h3>
      {shows.length === 0 && <p>No shows scheduled for this movie yet.</p>}
      <div className="grid">
        {shows.map((show) => (
          <div
            key={show._id}
            className="card"
            style={{
              border: selectedShow?._id === show._id ? '2px solid #4f7cff' : undefined,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedShow(show)}
          >
            <p><strong>{show.theatre}</strong></p>
            <p>{show.date} at {show.time}</p>
            <p style={{ opacity: 0.7, fontSize: 14 }}>
              {show.availableSeats} / {show.totalSeats} seats available
            </p>
          </div>
        ))}
      </div>

      {selectedShow && (
        <div className="card" style={{ marginTop: 16, maxWidth: 320 }}>
          <h4>Book: {selectedShow.theatre} — {selectedShow.date} {selectedShow.time}</h4>
          <label>Number of seats</label>
          <input
            type="number"
            min="1"
            max={selectedShow.availableSeats}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: '#4ade80' }}>{success}</p>}
          <button onClick={handleBook} disabled={booking} style={{ marginTop: 10 }}>
            {booking ? 'Booking...' : user ? 'Confirm Booking' : 'Login to Book'}
          </button>
        </div>
      )}
    </div>
  );
}
