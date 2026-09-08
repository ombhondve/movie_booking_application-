import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { movie: '', date: '', time: '', theatre: '', totalSeats: '' };

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([api.get('/shows'), api.get('/movies')])
      .then(([showsRes, moviesRes]) => {
        setShows(showsRes.data);
        setMovies(moviesRes.data);
      })
      .catch(() => setError('Failed to load data'));
  };

  useEffect(() => {
    loadData();
    setLoading(false);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.movie || !form.date || !form.time || !form.theatre || !form.totalSeats) {
      setError('All fields are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/shows/${editingId}`, form);
      } else {
        await api.post('/shows', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (show) => {
    setForm({
      movie: show.movie?._id || show.movie,
      date: show.date,
      time: show.time,
      theatre: show.theatre,
      totalSeats: show.totalSeats,
    });
    setEditingId(show._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>{editingId ? 'Edit Show' : 'Add Show'}</h3>
      <form onSubmit={handleSubmit}>
        <select name="movie" value={form.movie} onChange={handleChange}>
          <option value="">Select a movie</option>
          {movies.map((m) => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <input name="time" type="time" value={form.time} onChange={handleChange} />
        <input name="theatre" placeholder="Theatre / Screen" value={form.theatre} onChange={handleChange} />
        <input name="totalSeats" type="number" placeholder="Total Seats" value={form.totalSeats} onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Update' : 'Add'} Show</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: 24 }}>Existing Shows</h3>
      <table>
        <thead>
          <tr><th>Movie</th><th>Date</th><th>Time</th><th>Theatre</th><th>Seats</th><th></th></tr>
        </thead>
        <tbody>
          {shows.map((s) => (
            <tr key={s._id}>
              <td>{s.movie?.title || '—'}</td>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>{s.theatre}</td>
              <td>{s.availableSeats}/{s.totalSeats}</td>
              <td>
                <button className="secondary" onClick={() => handleEdit(s)}>Edit</button>{' '}
                <button className="danger" onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
