import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  CalendarClock,
  Ticket,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/axios.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [moviesRes, bookingsRes, showsRes] = await Promise.all([
          api.get('/movies'),
          api.get('/bookings/all'),
          api.get('/shows', { params: { includeCancelled: 'true' } }),
        ]);
        setMovies(moviesRes.data);
        setBookings(bookingsRes.data);
        setShows(showsRes.data);
      } catch {
        // dashboard stats are non-critical; fail quietly
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'confirmed').length, [bookings]);
  const cancelledCount = useMemo(() => bookings.filter((b) => b.status === 'cancelled').length, [bookings]);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 5),
    [bookings]
  );

  const upcomingShows = useMemo(() => {
    const now = new Date();
    return [...shows]
      .filter((s) => !s.cancelled && new Date(`${s.date}T${s.time}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
      .slice(0, 5);
  }, [shows]);

  const mostBooked = useMemo(() => {
    const counts = {};
    bookings
      .filter((b) => b.status === 'confirmed')
      .forEach((b) => {
        const title = b.show?.movie?.title;
        if (!title) return;
        counts[title] = (counts[title] || 0) + (b.seatsBooked || b.seatNumbers?.length || 1);
      });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [bookings]);

  const cards = [
    { label: 'Total Movies', value: movies.length, icon: Film, to: '/admin/movies' },
    { label: 'Total Shows', value: shows.length, icon: CalendarClock, to: '/admin/shows' },
    { label: 'Total Bookings', value: bookings.length, icon: Ticket, to: '/admin/bookings' },
    { label: 'Confirmed Bookings', value: confirmedCount, icon: CheckCircle2, to: '/admin/bookings' },
    { label: 'Cancelled Bookings', value: cancelledCount, icon: XCircle, to: '/admin/bookings' },
  ];

  if (loading) return <LoadingSpinner fullscreen label="Crunching the numbers…" />;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-paper">Admin dashboard</h1>
      <p className="mt-1 text-sm text-smoke">Manage movies, schedule shows, and keep an eye on bookings.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={to}
              className="group flex flex-col gap-4 rounded-xl border border-ink-line bg-ink-raised p-6 transition-colors hover:border-marquee/50"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-marquee" size={20} />
                <ArrowUpRight
                  size={16}
                  className="text-smoke transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-paper"
                />
              </div>
              <div>
                <p className="font-display text-3xl text-paper">{value}</p>
                <p className="text-sm text-smoke">{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-line bg-ink-raised p-5">
          <h2 className="mb-4 text-sm uppercase tracking-wide text-smoke">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-smoke">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentBookings.map((b) => (
                <li key={b._id} className="text-sm">
                  <p className="text-paper">{b.show?.movie?.title || 'Unknown'}</p>
                  <p className="text-xs text-smoke">
                    {b.user?.name || 'Unknown user'} · {b.status}
                    {b.bookingId ? ` · ${b.bookingId}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink-line bg-ink-raised p-5">
          <h2 className="mb-4 text-sm uppercase tracking-wide text-smoke">Upcoming Shows</h2>
          {upcomingShows.length === 0 ? (
            <p className="text-sm text-smoke">Nothing scheduled.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingShows.map((s) => (
                <li key={s._id} className="text-sm">
                  <p className="text-paper">{s.movie?.title || 'Unknown'}</p>
                  <p className="text-xs text-smoke">
                    {s.date} · {s.time} · {s.theatre}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink-line bg-ink-raised p-5">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm uppercase tracking-wide text-smoke">
            <TrendingUp size={14} /> Most Booked Movies
          </h2>
          {mostBooked.length === 0 ? (
            <p className="text-sm text-smoke">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {mostBooked.map(([title, seats]) => (
                <li key={title} className="flex items-center justify-between text-sm">
                  <span className="text-paper">{title}</span>
                  <span className="text-xs text-smoke">{seats} seats</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}