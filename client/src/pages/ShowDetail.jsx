import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import PosterArt from '../components/PosterArt.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const SEATS_PER_ROW = 10;

function seatLayout(totalSeats, bookedSeatNumbers) {
  const takenSet = new Set(bookedSeatNumbers || []);
  const rows = Math.ceil(totalSeats / SEATS_PER_ROW);
  const layout = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    const seatsInRow = Math.min(SEATS_PER_ROW, totalSeats - r * SEATS_PER_ROW);
    const row = [];
    for (let s = 0; s < seatsInRow; s++) {
      const id = `${rowLabel}${s + 1}`;
      row.push({
        id,
        taken: takenSet.has(id),
      });
    }
    layout.push({ rowLabel, seats: row });
  }
  return layout;
}

export default function ShowDetail() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${movieId}`),
          api.get('/shows', { params: { movieId } }),
        ]);
        if (cancelled) return;
        setMovie(movieRes.data);
        setShows(showsRes.data);
        if (showsRes.data.length > 0) setSelectedShow(showsRes.data[0]);
      } catch {
        if (!cancelled) setError('Could not load this movie’s showtimes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const layout = useMemo(() => {
    if (!selectedShow) return [];
    return seatLayout(selectedShow.totalSeats, selectedShow.bookedSeatNumbers);
  }, [selectedShow]);

  const chooseShow = async (show) => {
    setSelectedSeats([]);
    try {
      const res = await api.get(`/shows/${show._id}`);
      setSelectedShow(res.data);
    } catch {
      setSelectedShow(show);
    }
  };

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((s) => s !== seatId);
      if (prev.length >= selectedShow.availableSeats) {
        toast.error('No more seats available for this show.');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) return;

    setBooking(true);
    try {
      await api.post('/bookings', {
        showId: selectedShow._id,
        seatsBooked: selectedSeats.length,
        seatNumbers: selectedSeats,
      });
      toast.success(`Booked ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}!`);
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Try again.');
      // Someone may have grabbed one of these seats between our load and this
      // attempt — refresh the seat map so it reflects reality.
      try {
        const res = await api.get(`/shows/${selectedShow._id}`);
        setSelectedShow(res.data);
        setSelectedSeats([]);
      } catch {
        /* ignore refresh failure, the toast already told the user */
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen label="Fetching showtimes…" />;

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-smoke">
        {error || 'Movie not found.'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-paper"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex flex-col gap-8 sm:flex-row">
        <PosterArt title={movie.title} className="h-56 w-40 shrink-0 rounded-xl" />
        <div>
          <h1 className="font-display text-3xl text-paper">{movie.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-smoke">
            <span className="rounded-full border border-ink-line px-2.5 py-1">{movie.genre}</span>
            <span className="rounded-full border border-ink-line px-2.5 py-1">{movie.language}</span>
            <span className="rounded-full border border-ink-line px-2.5 py-1">{movie.duration} min</span>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-smoke">{movie.description}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm uppercase tracking-wide text-smoke">Showtimes</h2>
        {shows.length === 0 ? (
          <p className="text-smoke">No shows scheduled for this movie yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {shows.map((show) => (
              <button
                key={show._id}
                onClick={() => chooseShow(show)}
                className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedShow?._id === show._id
                    ? 'border-marquee bg-marquee/10'
                    : 'border-ink-line bg-ink-raised hover:border-ink-line/60'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-sm text-paper">
                  <CalendarDays size={13} /> {show.date}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-smoke">
                  <Clock size={12} /> {show.time}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-smoke">
                  <MapPin size={12} /> {show.theatre}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedShow && (
          <motion.div
            key={selectedShow._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-10 rounded-2xl border border-ink-line bg-ink-raised p-6"
          >
            <div className="mb-6 flex justify-center">
              <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-transparent via-marquee/50 to-transparent" />
            </div>
            <p className="mb-6 text-center text-xs uppercase tracking-widest text-smoke">Screen this way</p>

            <div className="flex flex-col items-center gap-2">
              {layout.map((row) => (
                <div key={row.rowLabel} className="flex items-center gap-2">
                  <span className="w-4 text-xs text-smoke">{row.rowLabel}</span>
                  {row.seats.map((seat) => {
                    const selected = selectedSeats.includes(seat.id);
                    return (
                      <motion.button
                        key={seat.id}
                        disabled={seat.taken}
                        onClick={() => toggleSeat(seat.id)}
                        whileTap={!seat.taken ? { scale: 0.85 } : {}}
                        className={`h-6 w-6 rounded-t-md text-[9px] transition-colors sm:h-7 sm:w-7 ${
                          seat.taken
                            ? 'cursor-not-allowed bg-ink-line text-smoke/40'
                            : selected
                            ? 'bg-marquee text-ink'
                            : 'bg-ink border border-ink-line text-smoke hover:border-marquee'
                        }`}
                        aria-label={`Seat ${seat.id}${seat.taken ? ' (taken)' : selected ? ' (selected)' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-smoke">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-ink-line bg-ink" /> Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-marquee" /> Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-ink-line" /> Taken
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-ink-line pt-6 sm:flex-row">
              <p className="text-sm text-smoke">
                {selectedSeats.length > 0
                  ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected: ${selectedSeats.join(', ')}`
                  : 'Tap seats above to select them.'}
              </p>
              <button
                onClick={handleBook}
                disabled={selectedSeats.length === 0 || booking}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-marquee px-6 py-2.5 font-medium text-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {booking && <Loader2 size={16} className="animate-spin" />}
                {booking ? 'Booking…' : user ? 'Confirm booking' : 'Log in to book'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}