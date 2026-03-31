import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookingProvider, useBooking } from './context/BookingContext';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// 🛡️ GUARD 1: Prevent logged-in users from seeing the Auth page
const AuthRoute = ({ children }) => {
  const { currentUser } = useBooking();
  // If they are already logged in, push them directly to their proper dashboard
  if (currentUser) {
    return <Navigate to={currentUser.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

// 🛡️ GUARD 2: Protect standard user routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useBooking();
  // If they are not logged in at all, kick them back to login
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// 🛡️ GUARD 3: Protect Admin-only routes
const AdminRoute = ({ children }) => {
  const { currentUser } = useBooking();
  // Not logged in? Go to login.
  if (!currentUser) return <Navigate to="/login" replace />; 
  // Logged in, but NOT an admin? Kick them to the regular user dashboard.
  if (currentUser.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    // The BookingProvider MUST wrap the Router so all pages can access the database
    <BookingProvider>
      <Router>
        {/* Global Toast Notifications Config */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#020617', // slate-950
              color: '#f8fafc', // slate-50
              border: '1px solid #1e293b', // slate-800
            },
          }} 
        />
        
        <Routes>
          {/* Public / Auth Routes */}
          {/* Both /login and /signup render the same Auth component, which toggles internally */}
          <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Auth /></AuthRoute>} />

          {/* Protected Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback Routes */}
          {/* Base URL automatically redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Any random/broken URL automatically redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </BookingProvider>
  );
}