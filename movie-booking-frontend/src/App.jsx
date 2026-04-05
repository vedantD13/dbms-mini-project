import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookingProvider, useBooking } from './context/BookingContext';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BuyTickets from './pages/BuyTickets';
import Checkout from './pages/Checkout';

// 🛡️ GUARD 1: Prevent logged-in users from seeing the Auth page
const AuthRoute = ({ children }) => {
  const { currentUser } = useBooking();
  if (currentUser) {
    return <Navigate to={currentUser.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

// 🛡️ GUARD 2: Protect standard user routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useBooking();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// 🛡️ GUARD 3: Protect Admin-only routes
const AdminRoute = ({ children }) => {
  const { currentUser } = useBooking();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BookingProvider>
      <Router>
        {/* Global Toast Notifications Config */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#020617', // slate-950
              color: '#f8fafc',      // slate-50
              border: '1px solid #1e293b', // slate-800
            },
          }}
        />

        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Auth /></AuthRoute>} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/buytickets/:id" element={<ProtectedRoute><BuyTickets /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

          {/* Protected Admin Route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </BookingProvider>
  );
}