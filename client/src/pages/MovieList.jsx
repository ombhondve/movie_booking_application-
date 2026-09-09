import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/movies');
        if (!cancelled) setMovies(res.data);
      } catch {
        if (!cancelled) setError('Could not load movies right now. Try refreshing.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="film-frame border-b border-ink-line bg-ink-raised/60 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2 text-marquee">
            <Clapperboard size={18} />
            <span className="text-sm tracking-wide">This week</span>
          </div>
          <h1 className="mt-2 max-w-xl font-display text-4xl leading-tight text-paper sm:text-5xl">
            Now showing across every screen in town
          </h1>
          <p className="mt-3 max-w-lg text-smoke">
            Pick a film, choose your seats, and get to your seat before the trailers end.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {loading && <LoadingSpinner label="Rolling the film…" fullscreen />}

        {!loading && error && (
          <div className="rounded-xl border border-velvet/40 bg-velvet/10 px-5 py-4 text-sm text-paper">
            {error}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="rounded-xl border border-ink-line bg-ink-raised px-6 py-14 text-center text-smoke">
            Nothing's playing yet. Check back once the admin adds a movie.
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {movies.map((movie) => (
              <motion.div key={movie._id} variants={cardVariants}>
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}