import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function MovieList() {
  const { user, isAdmin } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [watchlistIds, setWatchlistIds] = useState(new Set());

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

  useEffect(() => {
    if (!user || isAdmin) return;
    let cancelled = false;
    api
      .get('/users/watchlist')
      .then((res) => {
        if (!cancelled) setWatchlistIds(new Set(res.data.map((m) => m._id)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  const toggleFavorite = async (movie) => {
    const isFav = watchlistIds.has(movie._id);
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(movie._id) : next.add(movie._id);
      return next;
    });
    try {
      if (isFav) {
        await api.delete(`/users/watchlist/${movie._id}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post(`/users/watchlist/${movie._id}`);
        toast.success('Added to watchlist');
      }
    } catch {
      // revert on failure
      setWatchlistIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(movie._id) : next.delete(movie._id);
        return next;
      });
      toast.error('Could not update your watchlist.');
    }
  };

  const genres = useMemo(
    () => [...new Set(movies.map((m) => m.genre).filter(Boolean))].sort(),
    [movies]
  );
  const languages = useMemo(
    () => [...new Set(movies.map((m) => m.language).filter(Boolean))].sort(),
    [movies]
  );

  const filteredMovies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movies.filter((m) => {
      const matchesSearch = !q || m.title?.toLowerCase().includes(q);
      const matchesGenre = !genre || m.genre === genre;
      const matchesLanguage = !language || m.language === language;
      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, search, genre, language]);

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
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full rounded-full border border-ink-line bg-ink-raised py-2.5 pl-10 pr-4 text-sm text-paper placeholder:text-smoke focus:border-marquee focus:outline-none"
            />
          </div>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-full border border-ink-line bg-ink-raised px-4 py-2.5 text-sm text-paper focus:border-marquee focus:outline-none"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-full border border-ink-line bg-ink-raised px-4 py-2.5 text-sm text-paper focus:border-marquee focus:outline-none"
          >
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

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

        {!loading && !error && movies.length > 0 && filteredMovies.length === 0 && (
          <div className="rounded-xl border border-ink-line bg-ink-raised px-6 py-14 text-center text-smoke">
            No movies match your search or filters.
          </div>
        )}

        {!loading && !error && filteredMovies.length > 0 && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {filteredMovies.map((movie) => (
              <motion.div key={movie._id} variants={cardVariants}>
                <MovieCard
                  movie={movie}
                  isFavorite={watchlistIds.has(movie._id)}
                  onToggleFavorite={user && !isAdmin ? toggleFavorite : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}