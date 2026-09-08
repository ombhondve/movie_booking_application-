import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import ManageMovies from './ManageMovies.jsx';
import ManageShows from './ManageShows.jsx';
import AllBookings from './AllBookings.jsx';

export default function AdminDashboard() {
  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div className="admin-tabs">
        <NavLink to="movies" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          Movies
        </NavLink>
        <NavLink to="shows" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          Shows
        </NavLink>
        <NavLink to="bookings" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          All Bookings
        </NavLink>
      </div>
      <Routes>
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<ManageMovies />} />
        <Route path="shows" element={<ManageShows />} />
        <Route path="bookings" element={<AllBookings />} />
      </Routes>
    </div>
  );
}