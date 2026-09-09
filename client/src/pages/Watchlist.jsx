import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWatchlist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/watchlist');
      setMovies(res.data);
    } catch {
      setError('Could not load your watchlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const removeFavorite = async (movie) => {
    setMovies((prev) => prev.filter((m) => m._id !== movie._id));
    try {
      await api.delete(`/users/watchlist/${movie._id}`);
      toast.success('Removed from watchlist');
    } catch {
      toast.error('Could not remove this movie.');
      fetchWatchlist();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center gap-2 text-marquee">
        <Heart size={18} />
        <span className="text-sm tracking-wide">Saved</span>
      </div>
      <h1 className="mt-2 font-display text-3xl text-paper">My watchlist</h1>
      <p className="mt-1 text-sm text-smoke">Movies you've saved to watch later.</p>

      <div className="mt-8">
        {loading && <LoadingSpinner label="Loading your watchlist…" fullscreen />}

        {!loading && error && (
          <div className="rounded-xl border border-velvet/40 bg-velvet/10 px-5 py-4 text-sm text-paper">
            {error}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="rounded-xl border border-ink-line bg-ink-raised px-6 py-14 text-center text-smoke">
            No saved movies yet — tap the heart on a movie to add it here.
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {movies.map((movie) => (
              <motion.div
                key={movie._id}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              >
                <MovieCard movie={movie} isFavorite onToggleFavorite={removeFavorite} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}