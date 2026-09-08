import { useEffect, useState } from 'react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/movies')
      .then((res) => setMovies(res.data))
      .catch(() => setError('Failed to load movies'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container">
      <h2>Now Showing</h2>
      {error && <p className="error">{error}</p>}
      {!error && movies.length === 0 && <p>No movies available yet.</p>}
      <div className="grid">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
