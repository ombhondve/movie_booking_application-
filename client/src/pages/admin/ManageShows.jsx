import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const emptyForm = { movie: '', date: '', time: '', theatre: '', totalSeats: '' };

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [showsRes, moviesRes] = await Promise.all([api.get('/shows'), api.get('/movies')]);
      setShows(showsRes.data);
      setMovies(moviesRes.data);
    } catch (err) {
      setError('Could not load shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/shows', {
        movie: form.movie,
        date: form.date,
        time: form.time,
        theatre: form.theatre,
        totalSeats: Number(form.totalSeats),
      });
      setShows((prev) => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create show');
    }
  };

  const handleUpdateShow = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.put(`/shows/${editingId}`, {
        date: form.date,
        time: form.time,
        theatre: form.theatre,
        totalSeats: Number(form.totalSeats),
      });
      setShows((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update show');
    }
  };

  const startEdit = (show) => {
    setEditingId(show._id);
    setForm({
      movie: show.movie?._id || show.movie,
      date: show.date,
      time: show.time,
      theatre: show.theatre,
      totalSeats: show.totalSeats,
    });
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await api.delete(`/shows/${showId}`);
      setShows((prev) => prev.filter((s) => s._id !== showId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete show');
    }
  };

  return (
    <div>
      <form className="card" onSubmit={editingId ? handleUpdateShow : handleAddShow}>
        <h3>{editingId ? 'Edit Show' : 'Add Show'}</h3>
        {error && <p className="error">{error}</p>}
        <label>
          Movie
          <select
            value={form.movie}
            onChange={(e) => setForm({ ...form, movie: e.target.value })}
            required
            disabled={!!editingId}
          >
            <option value="">Select a movie</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Theatre / Screen
            <input
              value={form.theatre}
              onChange={(e) => setForm({ ...form, theatre: e.target.value })}
              required
            />
          </label>
          <label>
            Total Seats
            <input
              type="number"
              min={1}
              value={form.totalSeats}
              onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn" type="submit">
            {editingId ? 'Save Changes' : 'Add Show'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>All Shows</h3>
      {loading && <LoadingSpinner label="Loading shows..." />}
      <div className="admin-list">
        {shows.map((show) => (
          <div key={show._id} className="card admin-list-item">
            <div>
              <strong>{show.movie?.title || 'Unknown movie'}</strong>
              <p className="muted">
                {show.date} | {show.time} | {show.theatre}
              </p>
              <p className="muted">
                {show.availableSeats} / {show.totalSeats} seats available
              </p>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => startEdit(show)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteShow(show._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
