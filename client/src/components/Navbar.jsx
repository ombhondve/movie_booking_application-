import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clapperboard, LogOut, Ticket, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative py-2 text-sm transition-colors ${
          isActive ? 'text-paper' : 'text-smoke hover:text-paper'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-marquee rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/mine');
      setNotifications(res.data);
    } catch {
      /* non-critical */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.put('/notifications/read-all');
    } catch {
      /* non-critical */
    }
  };

  const markOneRead = async (n) => {
    if (n.read) return;
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    try {
      await api.put(`/notifications/${n._id}/read`);
    } catch {
      /* non-critical */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full border border-ink-line p-2 text-smoke transition-colors hover:border-velvet hover:text-paper"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-velvet px-1 text-[10px] text-paper">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-ink-line bg-ink-raised shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-ink-line px-4 py-2.5">
              <span className="text-sm text-paper">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-marquee hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-smoke">You're all caught up.</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markOneRead(n)}
                  className={`block w-full border-b border-ink-line/60 px-4 py-3 text-left text-xs transition-colors last:border-b-0 ${
                    n.read ? 'text-smoke' : 'bg-marquee/5 text-paper'
                  } hover:bg-ink-line/30`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-marquee" />}
                    <span>{n.message}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/80 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/movies" className="flex items-center gap-2 text-paper">
          <Clapperboard size={22} className="text-marquee" strokeWidth={1.75} />
          <span className="font-display text-xl tracking-tight">Reel</span>
        </NavLink>

        <nav className="hidden items-center gap-7 sm:flex">
          <NavItem to="/movies">Now Showing</NavItem>
          {user && !isAdmin && <NavItem to="/my-bookings">My Bookings</NavItem>}
          {user && !isAdmin && <NavItem to="/watchlist">Watchlist</NavItem>}
          {isAdmin && <NavItem to="/admin">Dashboard</NavItem>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!isAdmin && <NotificationBell />}
              <NavLink
                to="/profile"
                className="hidden items-center gap-1.5 text-sm text-smoke transition-colors hover:text-paper sm:inline-flex"
              >
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard size={14} /> {user.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket size={14} /> {user.name}
                  </span>
                )}
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-line px-3.5 py-1.5 text-sm text-smoke transition-colors hover:border-velvet hover:text-paper"
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm text-smoke hover:text-paper">
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-marquee px-4 py-1.5 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* mobile sub-nav */}
      <div className="flex items-center gap-6 border-t border-ink-line/60 px-6 py-2.5 text-sm sm:hidden">
        <NavItem to="/movies">Now Showing</NavItem>
        {user && !isAdmin && <NavItem to="/my-bookings">My Bookings</NavItem>}
        {user && !isAdmin && <NavItem to="/watchlist">Watchlist</NavItem>}
        {user && <NavItem to="/profile">Profile</NavItem>}
        {isAdmin && <NavItem to="/admin">Dashboard</NavItem>}
      </div>
    </header>
  );
}