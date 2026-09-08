import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <div className="card movie-card">
      <h3>{movie.title}</h3>
      <p className="muted">
        {movie.genre} | {movie.language} | {movie.duration} min
      </p>
      {movie.description && <p className="movie-desc">{movie.description}</p>}
      <Link className="btn" to={`/movies/${movie._id}`}>
        View Shows
      </Link>
    </div>
  );
}
