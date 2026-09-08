import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{movie.title}</h3>
      <p style={{ opacity: 0.7, fontSize: 14 }}>
        {movie.genre} · {movie.language} · {movie.duration} min
      </p>
      <p style={{ fontSize: 14 }}>{movie.description}</p>
      <Link to={`/movies/${movie._id}`}>
        <button>View Shows</button>
      </Link>
    </div>
  );
}
