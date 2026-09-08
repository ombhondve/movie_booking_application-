import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Fill in every field to continue.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created — log in to continue');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="ticket-notch film-frame rounded-2xl border border-ink-line bg-ink-raised px-8 py-10"
      >
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Film className="text-marquee" size={26} />
          <h1 className="font-display text-2xl text-paper">Join Reel</h1>
          <p className="text-sm text-smoke">Create an account to start booking.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm text-smoke">
              Name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={update('name')}
              placeholder="Jordan Rivera"
              className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none transition-colors placeholder:text-smoke/60 focus:border-marquee"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-smoke">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none transition-colors placeholder:text-smoke/60 focus:border-marquee"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-smoke">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 6 characters"
              className="rounded-lg border border-ink-line bg-ink px-3.5 py-2.5 text-paper outline-none transition-colors placeholder:text-smoke/60 focus:border-marquee"
            />
          </div>

          {error && <p className="text-sm text-velvet">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-marquee px-4 py-2.5 font-medium text-ink transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-smoke">
          Already have an account?{' '}
          <Link to="/login" className="text-paper underline decoration-marquee decoration-2 underline-offset-4">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}