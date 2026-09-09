import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MovieList from './pages/MovieList.jsx';
import ShowDetail from './pages/ShowDetail.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Profile from './pages/Profile.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageMovies from './pages/admin/ManageMovies.jsx';
import ManageShows from './pages/admin/ManageShows.jsx';
import AllBookings from './pages/admin/AllBookings.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12151C',
            color: '#EDEAE1',
            border: '1px solid #20242E',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/movies" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/shows/:movieId" element={<ShowDetail />} />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute adminOnly>
              <ManageMovies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shows"
          element={
            <ProtectedRoute adminOnly>
              <ManageShows />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <AllBookings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/movies" replace />} />
      </Routes>
    </div>
  );
}