import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await api.get('/movies');
        setMovies(res.data);
      } catch (err) {
        setError('Could not load movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="page">
      <h2>Now Showing</h2>
      {loading && <LoadingSpinner label="Loading movies..." />}
      {error && <p className="error">{error}</p>}
      {!loading && !error && movies.length === 0 && <p className="muted">No movies available yet.</p>}
      <div className="grid">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}