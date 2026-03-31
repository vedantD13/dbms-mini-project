import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState({
    movie: "Interstellar (Test Mode)", 
    cinema: "CineSync Premium",
    date: "Today",
    time: "09:30 PM",
    selectedSeats: [],
    totalAmount: 0
  });

  // Global State for Cinemas (Pre-loaded with one dummy cinema)
  const [cinemas, setCinemas] = useState([
    {
      id: 1,
      name: "CineSync Premium",
      location: "Mumbai",
      address: "R-City Mall, Ghatkopar West, Mumbai",
      lat: 19.0997,
      lng: 72.9164,
      screens: 6,
      premium: "IMAX_4DX"
    }
  ]);

  const updateBooking = (data) => setBookingData((prev) => ({ ...prev, ...data }));
  
  const clearBooking = () => setBookingData({ 
    movie: "Interstellar (Test Mode)", cinema: "CineSync Premium", date: "Today", time: "09:30 PM", selectedSeats: [], totalAmount: 0 
  });

  // Admin function to add a new cinema
  const addCinema = (newCinema) => {
    setCinemas((prev) => [...prev, { ...newCinema, id: Date.now() }]);
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBooking, clearBooking, cinemas, addCinema }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}