import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, Armchair, RefreshCcw, Ticket as TicketIcon, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import PosterArt from '../components/PosterArt.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import TicketView from '../components/TicketView.jsx';

const STATUS_STYLES = {
  confirmed: 'text-marquee border-marquee/40 bg-marquee/10',
  cancelled: 'text-velvet border-velvet/40 bg-velvet/10',
  pending: 'text-smoke border-ink-line bg-ink-raised',
};

function statusLabel(b) {
  if (b.status === 'cancelled') return 'Booking Cancelled';
  return 'Confirmed';
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null); // booking pending confirmation
  const [cancelling, setCancelling] = useState(false);
  const [ticketBooking, setTicketBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/mine');
      setBookings(res.data);
    } catch {
      setError('Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/bookings/${cancelTarget._id}`);
      setBookings((prev) => prev.map((b) => (b._id === cancelTarget._id ? res.data.booking : b)));
      toast.success('Booking cancelled');
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel this booking.');
    } finally {
      setCancelling(false);
    }
  };

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
                  <div>
                    <h3 className="font-display text-lg text-paper">
                      {b.show?.movie?.title || 'Movie unavailable'}
                    </h3>
                    {b.bookingId && (
                      <p className="mt-0.5 text-xs tracking-wide text-smoke">Booking ID: {b.bookingId}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                      STATUS_STYLES[b.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {statusLabel(b)}
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
                    <Armchair size={13} />
                    {b.seatNumbers?.length > 0
                      ? `Seat${b.seatNumbers.length > 1 ? 's' : ''} ${b.seatNumbers.join(', ')}`
                      : `${b.seatsBooked} seat${b.seatsBooked > 1 ? 's' : ''}`}
                  </span>
                </div>

                {b.status === 'confirmed' && b.rescheduled && (
                  <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    <RefreshCcw size={13} className="mt-0.5 shrink-0" />
                    <span>
                      This show was rescheduled
                      {b.previousShowDate && b.previousShowTime
                        ? ` from ${b.previousShowDate} ${b.previousShowTime}`
                        : ''}{' '}
                      to {b.show?.date} {b.show?.time}. Your seats stay the same.
                    </span>
                  </div>
                )}

                <div className="mt-1 flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => setTicketBooking(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-line px-3 py-1.5 text-xs text-paper transition-colors hover:border-marquee"
                  >
                    <TicketIcon size={13} /> View Ticket
                  </button>
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-velvet/40 px-3 py-1.5 text-xs text-velvet transition-colors hover:bg-velvet/10"
                    >
                      <XCircle size={13} /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title="Cancel booking?">
        <p className="text-sm text-smoke">Are you sure you want to cancel this booking?</p>
        {cancelTarget?.seatNumbers?.length > 0 && (
          <p className="mt-2 text-sm text-paper">Seats: {cancelTarget.seatNumbers.join(', ')}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setCancelTarget(null)}
            disabled={cancelling}
            className="rounded-lg border border-ink-line px-4 py-2 text-sm text-smoke hover:text-paper disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            onClick={confirmCancel}
            disabled={cancelling}
            className="rounded-lg bg-velvet px-4 py-2 text-sm font-medium text-paper transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
          </button>
        </div>
      </Modal>

      <Modal open={!!ticketBooking} onClose={() => setTicketBooking(null)} title="Your ticket">
        {ticketBooking && <TicketView booking={ticketBooking} />}
      </Modal>
    </div>
  );
}