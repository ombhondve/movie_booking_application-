import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, CalendarClock, Ticket, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios.js';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ movies: 0, shows: 0, bookings: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [movies, bookings] = await Promise.all([
          api.get('/movies'),
          api.get('/bookings/all'),
        ]);
        const showCount = await api.get('/shows');
        setCounts({
          movies: movies.data.length,
          shows: showCount.data.length,
          bookings: bookings.data.length,
        });
      } catch {
        // dashboard stats are non-critical; fail quietly
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Movies', value: counts.movies, icon: Film, to: '/admin/movies' },
    { label: 'Scheduled shows', value: counts.shows, icon: CalendarClock, to: '/admin/shows' },
    { label: 'Bookings made', value: counts.bookings, icon: Ticket, to: '/admin/bookings' },
  ];

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
    </div>
  );
}