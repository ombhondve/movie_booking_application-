import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const STATUS_STYLES = {
  confirmed: 'text-marquee border-marquee/40 bg-marquee/10',
  cancelled: 'text-velvet border-velvet/40 bg-velvet/10',
  pending: 'text-smoke border-ink-line bg-ink-raised',
};

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/bookings/all');
        setBookings(res.data);
      } catch {
        setError('Could not load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-paper">All bookings</h1>
      <p className="mt-1 text-sm text-smoke">Every booking made across the system.</p>

      <div className="mt-8">
        {loading && <LoadingSpinner fullscreen label="Loading bookings…" />}

        {!loading && error && (
          <div className="rounded-xl border border-velvet/40 bg-velvet/10 px-5 py-4 text-sm text-paper">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="rounded-xl border border-ink-line bg-ink-raised px-6 py-10 text-center text-smoke">
            No bookings have been made yet.
          </p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-ink-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-raised text-xs uppercase tracking-wide text-smoke">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">Show</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <motion.tr
                    key={b._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-ink-line bg-ink-raised/40"
                  >
                    <td className="px-4 py-3 text-paper">{b.user?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-paper">{b.show?.movie?.title || 'Unknown'}</td>
                    <td className="px-4 py-3 text-smoke">
                      {b.show?.date} · {b.show?.time} · {b.show?.theatre}
                    </td>
                    <td className="px-4 py-3 text-smoke">{b.seatsBooked}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${
                          STATUS_STYLES[b.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}