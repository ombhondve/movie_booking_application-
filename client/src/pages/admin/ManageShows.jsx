import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, X, Check, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const EMPTY_FORM = { movie: '', date: '', time: '', theatre: '', totalSeats: '' };

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [showsRes, moviesRes] = await Promise.all([api.get('/shows'), api.get('/movies')]);
      setShows(showsRes.data);
      setMovies(moviesRes.data);
    } catch {
      toast.error('Could not load shows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.movie || !form.date || !form.time || !form.theatre || !form.totalSeats) {
      toast.error('Fill in every field.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/shows', { ...form, totalSeats: Number(form.totalSeats) });
      setShows((prev) => [res.data, ...prev]);
      toast.success('Show scheduled.');
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create show.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      setShows((prev) => prev.filter((s) => s._id !== id));
      toast.success('Show removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove show.');
    }
  };

  const movieTitle = (id) => movies.find((m) => m._id === (id?._id || id))?.title || 'Unknown movie';

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">Manage shows</h1>
          <p className="mt-1 text-sm text-smoke">Schedule showtimes, screens, and seat counts.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-marquee px-4 py-2 text-sm font-medium text-ink"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Close' : 'Schedule show'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mt-6 overflow-hidden rounded-xl border border-ink-line bg-ink-raised p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={form.movie}
                onChange={update('movie')}
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              >
                <option value="">Select a movie…</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <input
                value={form.theatre}
                onChange={update('theatre')}
                placeholder="Theatre / Screen"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                type="date"
                value={form.date}
                onChange={update('date')}
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                type="time"
                value={form.time}
                onChange={update('time')}
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                type="number"
                min="1"
                value={form.totalSeats}
                onChange={update('totalSeats')}
                placeholder="Total seats"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee sm:col-span-2"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-marquee px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Schedule show
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner fullscreen label="Loading shows…" />
        ) : shows.length === 0 ? (
          <p className="rounded-xl border border-ink-line bg-ink-raised px-6 py-10 text-center text-smoke">
            No shows scheduled yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shows.map((show) => (
              <div
                key={show._id}
                className="flex items-center gap-4 rounded-xl border border-ink-line bg-ink-raised p-4"
              >
                <CalendarClock className="shrink-0 text-marquee" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-paper">{movieTitle(show.movie)}</p>
                  <p className="truncate text-xs text-smoke">
                    {show.date} · {show.time} · {show.theatre} · {show.availableSeats}/{show.totalSeats} seats left
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(show._id)}
                  className="rounded-lg border border-ink-line p-2 text-smoke hover:border-velvet hover:text-velvet"
                  aria-label="Delete show"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}