import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/">Movies</Link>
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12, opacity: 0.7 }}>
              {user.name} ({user.role})
            </span>
            <button className="secondary" onClick={handleLogout}>Logout</button>
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
