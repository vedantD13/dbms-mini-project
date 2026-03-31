import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast'; // Global notifications

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext'; // New Booking State

// Layouts & Utilities
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MovieInfo from './pages/MovieInfo';
import Showtimes from './pages/Showtimes';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound'; // New 404 Page

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            {/* Global Toast Notifications Config */}
            <Toaster 
              position="top-center" 
              toastOptions={{ 
                style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px', border: '1px solid #334155' } 
              }} 
            />
            
            <Routes>
              <Route element={<MainLayout />}>
                
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/movie/:id" element={<MovieInfo />} />
                <Route path="/buytickets/:id" element={<Showtimes />} />
                
                {/* PROTECTED ROUTES */}
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* ADMIN ROUTE */}
                <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />

                {/* 404 NOT FOUND ROUTE */}
                <Route path="*" element={<NotFound />} />

              </Route>
            </Routes>
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}