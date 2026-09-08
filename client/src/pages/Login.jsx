import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/movies');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
          <Ticket className="text-marquee" size={26} />
          <h1 className="font-display text-2xl text-paper">Welcome back</h1>
          <p className="text-sm text-smoke">Log in to book your next show.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-smoke">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-smoke">
          New here?{' '}
          <Link to="/register" className="text-paper underline decoration-marquee decoration-2 underline-offset-4">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}