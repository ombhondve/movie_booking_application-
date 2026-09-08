import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Languages } from 'lucide-react';
import PosterArt from './PosterArt.jsx';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(`/shows/${movie._id}`)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-line bg-ink-raised text-left"
    >
      <PosterArt title={movie.title} className="aspect-[2/3] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug text-paper">{movie.title}</h3>
        <p className="line-clamp-2 text-sm text-smoke">{movie.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-smoke">
          <span className="rounded-full border border-ink-line px-2 py-0.5">{movie.genre}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {movie.duration}m
          </span>
          <span className="inline-flex items-center gap-1">
            <Languages size={12} /> {movie.language}
          </span>
        </div>
      </div>
    </motion.button>
  );
}