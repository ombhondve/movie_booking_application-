import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ShowDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedShowId, setSelectedShowId] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res1 = await api.get(`/movies/${movieId}`);
        setMovie(res1.data);

        const res = await api.get('/shows', { params: { movieId } });
        setShows(res.data);
      } catch (err) {
        setError('Could not load show details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  const selectedShow = shows.find((s) => s._id === selectedShowId);

  const handleBookSeats = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBooking(true);
    setBookError('');
    setBookSuccess('');
    try {
      await api.post('/bookings', {
        showId: selectedShowId,
        seatsBooked: Number(seatCount),
      });
      setBookSuccess('Booking confirmed!');
      setShows((prev) =>
        prev.map((s) =>
          s._id === selectedShowId
            ? { ...s, availableSeats: s.availableSeats - Number(seatCount) }
            : s
        )
      );
      setTimeout(() => navigate('/my-bookings'), 800);
    } catch (err) {
      setBookError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading show details..." />;
  if (error) return <p className="error">{error}</p>;
  if (!movie) return <p className="error">Movie not found</p>;

  return (
    <div className="page">
      <Link to="/movies" className="back-link">
        Back to movies
      </Link>
      <h2>{movie.title}</h2>
      <p className="muted">
        {movie.genre} | {movie.language} | {movie.duration} min
      </p>
      {movie.description && <p>{movie.description}</p>}

      <h3>Available Shows</h3>
      {shows.length === 0 && <p className="muted">No shows scheduled for this movie yet.</p>}
      <div className="show-list">
        {shows.map((show) => (
          <button
            key={show._id}
            type="button"
            className={`show-chip ${selectedShowId === show._id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedShowId(show._id);
              setBookError('');
              setBookSuccess('');
            }}
            disabled={show.availableSeats <= 0}
          >
            <div>{show.date} | {show.time}</div>
            <div className="muted">{show.theatre}</div>
            <div className="muted">
              {show.availableSeats > 0 ? `${show.availableSeats} seats left` : 'Sold out'}
            </div>
          </button>
        ))}
      </div>

      {selectedShow && (
        <form className="card booking-form" onSubmit={handleBookSeats}>
          <h3>Book Seats</h3>
          <p className="muted">
            {movie.title} - {selectedShow.date} {selectedShow.time} at {selectedShow.theatre}
          </p>
          {bookError && <p className="error">{bookError}</p>}
          {bookSuccess && <p className="success">{bookSuccess}</p>}
          <label>
            Number of seats
            <input
              type="number"
              min={1}
              max={selectedShow.availableSeats}
              value={seatCount}
              onChange={(e) => setSeatCount(e.target.value)}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={booking || selectedShow.availableSeats <= 0}>
            {booking ? 'Booking...' : isAuthenticated ? 'Confirm Booking' : 'Login to Book'}
          </button>
        </form>
      )}
    </div>
  );
}
