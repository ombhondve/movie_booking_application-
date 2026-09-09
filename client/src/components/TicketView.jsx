import { Clapperboard } from 'lucide-react';

const STATUS_STYLES = {
  confirmed: 'text-marquee border-marquee/40 bg-marquee/10',
  cancelled: 'text-velvet border-velvet/40 bg-velvet/10',
};

export default function TicketView({ booking }) {
  const show = booking.show;
  const status = booking.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';

  return (
    <div className="ticket-notch overflow-hidden rounded-xl border border-ink-line bg-ink">
      <div className="flex flex-col items-center gap-1 border-b border-dashed border-ink-line px-6 py-5">
        <Clapperboard size={22} className="text-marquee" strokeWidth={1.75} />
        <span className="font-display text-xl tracking-widest text-paper">REEL</span>
      </div>

      <div className="flex flex-col gap-3 px-6 py-5 text-sm">
        <Row label="Movie" value={show?.movie?.title || 'Unavailable'} big />
        <Row label="Date" value={show?.date} />
        <Row label="Time" value={show?.time} />
        <Row label="Theatre" value={show?.theatre} />
        <Row
          label="Seats"
          value={booking.seatNumbers?.length ? booking.seatNumbers.join(', ') : String(booking.seatsBooked)}
        />
        <Row label="Booking ID" value={booking.bookingId || '—'} />

        <div className="mt-2 flex items-center justify-between border-t border-dashed border-ink-line pt-4">
          <span className="text-xs uppercase tracking-wide text-smoke">Status</span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${
              STATUS_STYLES[booking.status] || STATUS_STYLES.confirmed
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-wide text-smoke">{label}</span>
      <span className={big ? 'font-display text-base text-paper' : 'text-paper'}>{value || '—'}</span>
    </div>
  );
}