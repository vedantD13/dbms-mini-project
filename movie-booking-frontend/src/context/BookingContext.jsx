import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function BookingProvider({ children }) {
  // Global States (Start empty, fetch from DB)
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    movie: null, cinema: null, date: "Today", time: "09:30 PM", selectedSeats: [], totalAmount: 0
  });
  const [globalBookedSeats, setGlobalBookedSeats] = useState([]);

  // 🔥 FETCH INITIAL DATA ON LOAD
  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    fetchUsers();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch(`${API_URL}/movies`);
    const data = await res.json();
    setMovies(data);
  };

  const fetchCinemas = async () => {
    const res = await fetch(`${API_URL}/cinemas`);
    const data = await res.json();
    setCinemas(data);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setUsers(data);
  };

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
    fetchUsers(); // Refresh admin user list
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ==========================================
  // MOVIES CRUD
  // ==========================================
  const addMovie = async (newMovie) => {
    const res = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie)
    });
    const data = await res.json();
    setMovies((prev) => [...prev, data]);
  };

  const editMovie = async (id, updatedData) => {
    await fetch(`${API_URL}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
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
    setCinemas((prev) => [...prev, data]);
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

  // Local Cart State
  const updateBooking = (data) => setBookingData((prev) => ({ ...prev, ...data }));
  const clearBooking = () => setBookingData({ movie: null, cinema: null, date: "Today", time: "09:30 PM", selectedSeats: [], totalAmount: 0 });
  const confirmBooking = (seatsToLock) => setGlobalBookedSeats((prev) => [...prev, ...seatsToLock]);

  return (
    <BookingContext.Provider value={{ 
      bookingData, updateBooking, clearBooking, globalBookedSeats, confirmBooking,
      movies, addMovie, editMovie, deleteMovie,
      cinemas, addCinema, deleteCinema,
      users, updateUserStatus, deleteUser,
      currentUser, login, register, logout 
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}