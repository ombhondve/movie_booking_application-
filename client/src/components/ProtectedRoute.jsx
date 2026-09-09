import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, initializing, isAdmin } = useAuth();

  if (initializing) {
    return <LoadingSpinner fullscreen label="Checking your ticket…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/movies" replace />;
  }

  return children;
}