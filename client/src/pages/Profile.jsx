import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/users/me')
      .then((res) => {
        if (cancelled) return;
        setProfile(res.data);
        setName(res.data.name || '');
      })
      .catch(() => toast.error('Could not load your profile.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name });
      setProfile(res.data);
      // Keep the auth context (and navbar greeting) in sync with the new name
      const token = localStorage.getItem('token');
      login({ ...user, name: res.data.name }, token);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen label="Loading your profile…" />;

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <div className="flex items-center gap-2 text-marquee">
        <UserCircle size={18} />
        <span className="text-sm tracking-wide">Account</span>
      </div>
      <h1 className="mt-2 font-display text-3xl text-paper">Profile</h1>
      <p className="mt-1 text-sm text-smoke">Your account details.</p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="mt-8 flex flex-col gap-5 rounded-xl border border-ink-line bg-ink-raised p-6"
      >
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-smoke">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm text-paper focus:border-marquee focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-smoke">Email</label>
          <div className="flex items-center gap-2 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm text-smoke">
            <Mail size={14} /> {profile?.email}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-marquee px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </motion.form>
    </div>
  );
}