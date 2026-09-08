import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { title: '', genre: '', duration: '', language: '', description: '' };

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMovies = () => {
    api.get('/movies').then((res) => setMovies(res.data)).catch(() => setError('Failed to load movies'));
  };

  useEffect(() => {
    loadMovies();
    setLoading(false);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.genre || !form.duration || !form.language) {
      setError('Title, genre, duration, and language are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/movies/${editingId}`, form);
      } else {
        await api.post('/movies', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (movie) => {
    setForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      language: movie.language,
      description: movie.description || '',
    });
    setEditingId(movie._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      loadMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>{editingId ? 'Edit Movie' : 'Add Movie'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input name="genre" placeholder="Genre" value={form.genre} onChange={handleChange} />
        <input name="duration" type="number" placeholder="Duration (minutes)" value={form.duration} onChange={handleChange} />
        <input name="language" placeholder="Language" value={form.language} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Update' : 'Add'} Movie</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: 24 }}>Existing Movies</h3>
      <table>
        <thead>
          <tr><th>Title</th><th>Genre</th><th>Duration</th><th>Language</th><th></th></tr>
        </thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m._id}>
              <td>{m.title}</td>
              <td>{m.genre}</td>
              <td>{m.duration} min</td>
              <td>{m.language}</td>
              <td>
                <button className="secondary" onClick={() => handleEdit(m)}>Edit</button>{' '}
                <button className="danger" onClick={() => handleDelete(m._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
