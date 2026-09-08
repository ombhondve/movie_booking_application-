import { NavLink, useNavigate } from 'react-router-dom';
import { Clapperboard, LogOut, Ticket, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

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
          {isAdmin && <NavItem to="/admin">Dashboard</NavItem>}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-smoke sm:inline">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard size={14} /> {user.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket size={14} /> {user.name}
                  </span>
                )}
              </span>
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
        {isAdmin && <NavItem to="/admin">Dashboard</NavItem>}
      </div>
    </header>
  );
}