import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const emptyForm = { title: '', genre: '', duration: '', language: '', description: '' };

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    fetchMovies();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, duration: Number(form.duration) };
      const res = await api.post('/movies', payload);
      setMovies((prev) => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add movie');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, duration: Number(form.duration) };
      const res = await api.put(`/movies/${editingId}`, payload);
      setMovies((prev) => prev.map((m) => (m._id === editingId ? res.data : m)));
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update movie');
    }
  };

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      language: movie.language,
      description: movie.description || '',
    });
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete movie');
    }
  };

  return (
    <div>
      <form className="card" onSubmit={editingId ? handleUpdateMovie : handleAddMovie}>
        <h3>{editingId ? 'Edit Movie' : 'Add Movie'}</h3>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            Genre
            <input
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Duration (min)
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </label>
          <label>
            Language
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {editingId ? 'Save Changes' : 'Add Movie'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>All Movies</h3>
      {loading && <LoadingSpinner label="Loading movies..." />}
      <div className="admin-list">
        {movies.map((movie) => (
          <div key={movie._id} className="card admin-list-item">
            <div>
              <strong>{movie.title}</strong>
              <p className="muted">
                {movie.genre} | {movie.language} | {movie.duration} min
              </p>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => startEdit(movie)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteMovie(movie._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
