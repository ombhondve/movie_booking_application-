
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/movies" className="brand">
        🎬 Movie Booking
      </Link>
      <div className="nav-links">
        <Link to="/movies">Movies</Link>
        {user && !isAdmin && <Link to="/my-bookings">My Bookings</Link>}
        {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
        {user ? (
          <>
            <span className="muted">Hi, {user.name}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
