import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth();
  
  // 1. If not logged in at all, kick them back to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If this route requires Admin, but the user's role is NOT admin, kick them to the dashboard
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Otherwise, they have the correct permissions! Render the page.
  return children;
}