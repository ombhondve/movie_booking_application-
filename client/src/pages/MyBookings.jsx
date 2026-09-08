import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, Armchair } from 'lucide-react';
import api from '../api/axios.js';
import PosterArt from '../components/PosterArt.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const STATUS_STYLES = {
  confirmed: 'text-marquee border-marquee/40 bg-marquee/10',
  cancelled: 'text-velvet border-velvet/40 bg-velvet/10',
  pending: 'text-smoke border-ink-line bg-ink-raised',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/bookings/mine');
        if (!cancelled) setBookings(res.data);
      } catch {
        if (!cancelled) setError('Could not load your bookings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl text-paper">My bookings</h1>
      <p className="mt-1 text-sm text-smoke">Every ticket you've booked, past and upcoming.</p>

      <div className="mt-8">
        {loading && <LoadingSpinner label="Pulling up your tickets…" fullscreen />}

        {!loading && error && (
          <div className="rounded-xl border border-velvet/40 bg-velvet/10 px-5 py-4 text-sm text-paper">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-xl border border-ink-line bg-ink-raised px-6 py-14 text-center text-smoke">
            No bookings yet — go find something to watch.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {bookings.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="ticket-notch flex overflow-hidden rounded-xl border border-ink-line bg-ink-raised"
            >
              <PosterArt title={b.show?.movie?.title || '?'} className="w-24 shrink-0 sm:w-32" />
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg text-paper">
                    {b.show?.movie?.title || 'Movie unavailable'}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs capitalize ${
                      STATUS_STYLES[b.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-smoke">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} /> {b.show?.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} /> {b.show?.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} /> {b.show?.theatre}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Armchair size={13} /> {b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}