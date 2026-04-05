import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BookingContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function BookingProvider({ children }) {
  // Restore user from localStorage on first load (prevents logout on refresh)
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinesync_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [userBookings, setUserBookings] = useState([]);

  const [bookingData, setBookingData] = useState({
    movie: null, cinema: null, cinemaId: null, movieId: null,
    date: null, time: "07:30 PM", selectedSeats: [], totalAmount: 0,
    format: null, poster: null
  });
  // globalBookedSeats is now only the in-memory overlay for the current session
  // The real booked seats come from the DB via fetchBookedSeats
  const [globalBookedSeats, setGlobalBookedSeats] = useState([]);

  // 🔥 FETCH INITIAL DATA ON LOAD
  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    fetchUsers();
  }, []);

  // Fetch user bookings whenever the logged-in user changes
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      fetchUserBookings(currentUser.id);
    } else {
      setUserBookings([]);
    }
  }, [currentUser]);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (e) { console.error('fetchMovies error:', e); }
  };

  const fetchCinemas = async () => {
    try {
      const res = await fetch(`${API_URL}/cinemas`);
      const data = await res.json();
      setCinemas(data);
    } catch (e) { console.error('fetchCinemas error:', e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error('fetchUsers error:', e); }
  };

  const fetchUserBookings = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/bookings/user/${userId}`);
      if (!res.ok) { console.warn('fetchUserBookings: backend returned', res.status); return; }
      const data = await res.json();
      if (Array.isArray(data)) setUserBookings(data);
    } catch (e) { console.error('fetchUserBookings error:', e); }
  };

  // Fetch already-booked seats for a specific show (for seat map)
  const fetchBookedSeats = useCallback(async (cinemaId, showDate, showTime) => {
    try {
      const params = new URLSearchParams({ cinema_id: cinemaId, show_date: showDate, show_time: showTime });
      const res = await fetch(`${API_URL}/bookings/seats?${params}`);
      if (!res.ok) { console.warn('fetchBookedSeats: backend returned', res.status); return []; }
      const data = await res.json();
      return data.bookedSeats || [];
    } catch (e) {
      console.error('fetchBookedSeats error:', e);
      return [];
    }
  }, []);

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setCurrentUser(data);
    localStorage.setItem('cinesync_user', JSON.stringify(data)); // persist session
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setCurrentUser(data);
    localStorage.setItem('cinesync_user', JSON.stringify(data)); // persist session
    fetchUsers();
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cinesync_user'); // clear session
    setUserBookings([]);
    clearBooking();
  };

  const updateProfile = async (userId, name) => {
    const res = await fetch(`${API_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(prev => {
        const updated = { ...prev, name };
        localStorage.setItem('cinesync_user', JSON.stringify(updated)); // keep localStorage in sync
        return updated;
      });
    }
    return data;
  };

  // ==========================================
  // MOVIES CRUD
  // ==========================================
  const addMovie = async (newMovie) => {
    const res = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newMovie.title,
        poster_url: newMovie.poster || newMovie.poster_url,
        trailer_url: newMovie.trailerUrl || newMovie.trailer_url,
        category: newMovie.category,
        genre: newMovie.genre,
        format: newMovie.format
      })
    });
    const data = await res.json();
    setMovies((prev) => [...prev, data]);
  };

  const editMovie = async (id, updatedData) => {
    await fetch(`${API_URL}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedData.title,
        poster_url: updatedData.poster || updatedData.poster_url,
        trailer_url: updatedData.trailerUrl || updatedData.trailer_url,
        category: updatedData.category,
        genre: updatedData.genre,
        format: updatedData.format
      })
    });
    setMovies((prev) => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  };

  const deleteMovie = async (id) => {
    await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
    setMovies((prev) => prev.filter(m => m.id !== id));
  };

  // ==========================================
  // CINEMAS CRUD
  // ==========================================
  const addCinema = async (newCinema) => {
    const res = await fetch(`${API_URL}/cinemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCinema)
    });
    const data = await res.json();
    setCinemas((prev) => [...prev, { ...data, seatLayout: newCinema.seatLayout }]);
  };

  const deleteCinema = async (id) => {
    await fetch(`${API_URL}/cinemas/${id}`, { method: 'DELETE' });
    setCinemas((prev) => prev.filter(c => c.id !== id));
  };

  // ==========================================
  // USERS MANAGEMENT (Admin)
  // ==========================================
  const updateUserStatus = async (id, status) => {
    await fetch(`${API_URL}/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const deleteUser = async (id) => {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter(u => u.id !== id));
  };

  // ==========================================
  // BOOKING CART & CREATION
  // ==========================================
  const updateBooking = (data) => setBookingData((prev) => ({ ...prev, ...data }));

  const clearBooking = () => setBookingData({
    movie: null, cinema: null, cinemaId: null, movieId: null,
    date: null, time: "07:30 PM", selectedSeats: [], totalAmount: 0,
    format: null, poster: null
  });

  // Lock seats in memory immediately (optimistic update)
  const confirmBooking = (seatsToLock) => {
    setGlobalBookedSeats((prev) => [...prev, ...seatsToLock]);
  };

  // Create a booking in the database (called after successful payment)
  const createBooking = async (bookingPayload) => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });

    // Check if response is JSON before parsing (backend returns HTML 404 pages otherwise)
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Backend error (${res.status}): Server not running or route not found`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Booking failed');

    // Refresh user bookings so My Tickets tab updates
    if (currentUser) fetchUserBookings(currentUser.id);
    return data;
  };


  return (
    <BookingContext.Provider value={{
      bookingData, updateBooking, clearBooking, globalBookedSeats, confirmBooking,
      createBooking, fetchBookedSeats,
      movies, addMovie, editMovie, deleteMovie,
      cinemas, addCinema, deleteCinema,
      users, updateUserStatus, deleteUser,
      currentUser, login, register, logout, updateProfile,
      userBookings, fetchUserBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}