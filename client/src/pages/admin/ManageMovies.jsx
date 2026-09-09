import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PosterArt from '../../components/PosterArt.jsx';

const EMPTY_FORM = { title: '', genre: '', duration: '', language: '', description: '' };

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies');
      setMovies(res.data);
    } catch {
      toast.error('Could not load movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (movie) => {
    setForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      language: movie.language,
      description: movie.description,
    });
    setEditingId(movie._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.genre || !form.duration || !form.language) {
      toast.error('Fill in every field.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, duration: Number(form.duration) };
      if (editingId) {
        const res = await api.put(`/movies/${editingId}`, payload);
        setMovies((prev) => prev.map((m) => (m._id === editingId ? res.data : m)));
        toast.success('Movie updated.');
      } else {
        const res = await api.post('/movies', payload);
        setMovies((prev) => [res.data, ...prev]);
        toast.success('Movie added.');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save movie.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie? Its shows will remain but reference a missing movie.')) return;
    try {
      await api.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m._id !== id));
      toast.success('Movie deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete movie.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">Manage movies</h1>
          <p className="mt-1 text-sm text-smoke">Add new releases and keep listings up to date.</p>
        </div>
        <button
          onClick={() => (showForm && !editingId ? resetForm() : (setForm(EMPTY_FORM), setEditingId(null), setShowForm(true)))}
          className="inline-flex items-center gap-1.5 rounded-lg bg-marquee px-4 py-2 text-sm font-medium text-ink"
        >
          {showForm && !editingId ? <X size={15} /> : <Plus size={15} />}
          {showForm && !editingId ? 'Close' : 'Add movie'}
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
              <input
                value={form.title}
                onChange={update('title')}
                placeholder="Title"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                value={form.genre}
                onChange={update('genre')}
                placeholder="Genre"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={update('duration')}
                placeholder="Duration (minutes)"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <input
                value={form.language}
                onChange={update('language')}
                placeholder="Language"
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee"
              />
              <textarea
                value={form.description}
                onChange={update('description')}
                placeholder="Description"
                rows={3}
                className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none focus:border-marquee sm:col-span-2"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-marquee px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingId ? 'Save changes' : 'Add movie'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-ink-line px-4 py-2 text-sm text-smoke hover:text-paper"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner fullscreen label="Loading movies…" />
        ) : movies.length === 0 ? (
          <p className="rounded-xl border border-ink-line bg-ink-raised px-6 py-10 text-center text-smoke">
            No movies yet — add your first one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="flex items-center gap-4 rounded-xl border border-ink-line bg-ink-raised p-4"
              >
                <PosterArt title={movie.title} className="h-16 w-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-paper">{movie.title}</p>
                  <p className="truncate text-xs text-smoke">
                    {movie.genre} · {movie.language} · {movie.duration}m
                  </p>
                </div>
                <button
                  onClick={() => startEdit(movie)}
                  className="rounded-lg border border-ink-line p-2 text-smoke hover:border-marquee hover:text-paper"
                  aria-label={`Edit ${movie.title}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="rounded-lg border border-ink-line p-2 text-smoke hover:border-velvet hover:text-velvet"
                  aria-label={`Delete ${movie.title}`}
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