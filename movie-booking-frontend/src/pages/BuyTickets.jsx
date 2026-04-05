import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, Ticket, MapPin, Calendar, Clock, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SHOW_TIMES = ['10:00 AM', '01:30 PM', '04:30 PM', '07:30 PM', '10:15 PM'];
const SHOW_DATE = new Date().toISOString().split('T')[0];

export default function BuyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, cinemas, currentUser, updateBooking, fetchBookedSeats } = useBooking();

  const movie = movies.find(m => m.id === parseInt(id));

  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedTime, setSelectedTime] = useState(SHOW_TIMES[3]); // default 7:30 PM
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]); // seats already booked from DB
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Set default cinema once cinemas load
  useEffect(() => {
    if (cinemas.length > 0 && !selectedCinema) {
      setSelectedCinema(cinemas[0]);
    }
  }, [cinemas]);

  // Fetch already-booked seats from DB whenever cinema or time changes
  useEffect(() => {
    if (selectedCinema) {
      setLoadingSeats(true);
      setSelectedSeats([]); // reset selected seats on change
      fetchBookedSeats(selectedCinema.id, SHOW_DATE, selectedTime).then(seats => {
        setBookedSeats(seats);
        setLoadingSeats(false);
      });
    }
  }, [selectedCinema, selectedTime]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-center p-10">
        <div>
          <Film size={64} className="mx-auto mb-4 text-slate-700" />
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-slate-500 mb-6">This movie may have been removed.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const seatLayout = selectedCinema?.seatLayout;

  const getSeatDetails = (seatId) => {
    if (!seatLayout) return { tier: 'Standard', price: 150, bg: 'bg-slate-500' };
    const row = seatId.charAt(0);
    if (seatLayout.pricing?.VIP?.includes(row)) return { tier: 'VIP Recliner', price: 500, bg: 'bg-amber-500' };
    if (seatLayout.pricing?.Premium?.includes(row)) return { tier: 'Premium', price: 250, bg: 'bg-indigo-500' };
    return { tier: 'Standard', price: 150, bg: 'bg-slate-500' };
  };

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // already booked — blocked
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) return toast.error('Max 6 seats per transaction.');
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalAmount = selectedSeats.reduce((t, s) => t + getSeatDetails(s).price, 0)
    + (selectedSeats.length > 0 ? selectedSeats.length * 30 : 0); // + convenience fee

  const handleProceedToCheckout = () => {
    if (!selectedCinema) return toast.error('Please select a cinema.');
    if (selectedSeats.length === 0) return toast.error('Please select at least one seat.');

    // Populate the global booking cart before navigating
    updateBooking({
      movie: movie.title,
      movieId: movie.id,
      format: movie.format,
      poster: movie.poster_url,
      cinema: selectedCinema.name,
      cinemaId: selectedCinema.id,
      date: new Date(SHOW_DATE).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: selectedTime,
      showDate: SHOW_DATE,
      selectedSeats: selectedSeats,
      totalAmount: totalAmount
    });

    navigate('/checkout');
  };

  const rows = seatLayout?.rows || [];
  const totalCols = seatLayout?.cols || 10;
  const aisleAfter = seatLayout?.aisleAfter || Math.floor(totalCols / 2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-24 pb-20 px-4 md:px-6">
      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center px-6 py-4 gap-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-bold text-white truncate">{movie.title}</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        {/* MOVIE HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-40 md:w-52 h-auto rounded-2xl shadow-2xl shadow-amber-500/10 border border-slate-800 shrink-0 object-cover"
          />
          <div className="flex flex-col justify-end">
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{movie.format} • {movie.genre}</div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-amber-500"/> {new Date(SHOW_DATE).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: CINEMA & TIME SELECTION + SEAT MAP */}
          <div className="lg:col-span-2 space-y-6">

            {/* Select Cinema */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"><MapPin size={14}/> Select Cinema</h3>
              <div className="flex flex-wrap gap-3">
                {cinemas.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCinema(c)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedCinema?.id === c.id ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    {c.name} <span className="text-xs opacity-60 ml-1">{c.location}</span>
                  </button>
                ))}
                {cinemas.length === 0 && <p className="text-slate-500 text-sm">No cinemas available. Ask admin to add cinemas.</p>}
              </div>
            </div>

            {/* Select Show Time */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"><Clock size={14}/> Select Showtime</h3>
              <div className="flex flex-wrap gap-3">
                {SHOW_TIMES.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedTime === time ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Map */}
            {selectedCinema && seatLayout && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-amber-500 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest"><Ticket size={14}/> Select Seats</h3>

                {/* Screen */}
                <div className="w-full max-w-xl mx-auto mb-8 relative flex flex-col items-center">
                  <div className="w-full h-2 bg-amber-500/40 rounded-full blur-[2px]"></div>
                  <div className="w-full h-8 bg-gradient-to-b from-amber-500/15 to-transparent -mt-1 blur-lg"></div>
                  <div className="absolute top-3 text-amber-500/50 text-[10px] font-bold tracking-[0.3em] uppercase">SCREEN</div>
                </div>

                {loadingSeats ? (
                  <div className="text-center py-10 text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
                    Loading seat availability...
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 overflow-x-auto pb-4">
                    {rows.map(row => (
                      <div key={row} className="flex items-center justify-center gap-2 min-w-max mx-auto">
                        <span className="w-6 text-center text-xs font-bold text-slate-500">{row}</span>
                        <div className="flex gap-1.5">
                          {Array.from({ length: totalCols }, (_, i) => {
                            const seatId = `${row}${i + 1}`;
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const details = getSeatDetails(seatId);
                            const isAisle = i + 1 === aisleAfter;
                            return (
                              <div key={seatId} className={`flex items-center ${isAisle ? 'mr-4' : ''}`}>
                                <button
                                  disabled={isBooked}
                                  onClick={() => toggleSeat(seatId)}
                                  title={isBooked ? 'Already Booked' : `${details.tier} ₹${details.price}`}
                                  className={`w-8 h-8 rounded-t-lg rounded-b-sm text-[9px] font-bold transition-all duration-200 relative
                                    ${isBooked
                                      ? 'bg-slate-800 opacity-40 cursor-not-allowed'
                                      : isSelected
                                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-110 -translate-y-1 text-white'
                                        : `${details.bg} hover:-translate-y-1 hover:brightness-125 text-white`
                                    }`}
                                >
                                  {!isBooked && <span className="opacity-70">{i + 1}</span>}
                                  {isBooked && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <span className="w-3 h-0.5 bg-slate-600 rotate-45 absolute"></span>
                                      <span className="w-3 h-0.5 bg-slate-600 -rotate-45 absolute"></span>
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <span className="w-6 text-center text-xs font-bold text-slate-500">{row}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center mt-6 pt-5 border-t border-slate-800 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-t bg-slate-800 opacity-40"></div> Booked</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-t bg-emerald-500"></div> <span className="text-white">Selected</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-t bg-amber-500"></div> VIP ₹500</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-t bg-indigo-500"></div> Premium ₹250</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-t bg-slate-500"></div> Standard ₹150</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: BOOKING SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-dashed border-slate-800">
                <h3 className="font-black text-lg mb-1 flex items-center gap-2"><Ticket size={18} className="text-amber-500"/> Booking Summary</h3>
                <p className="text-xs text-slate-500">{selectedCinema?.name || 'Select cinema'} · {selectedTime}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Selected Seats</span>
                  <span className="text-white font-bold text-right max-w-[55%] break-words">{selectedSeats.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tickets ({selectedSeats.length})</span>
                  <span className="text-white">₹{selectedSeats.reduce((t, s) => t + getSeatDetails(s).price, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Convenience Fee</span>
                  <span className="text-white">₹{selectedSeats.length * 30}</span>
                </div>
                <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
                  <span className="text-slate-300 font-medium">Total</span>
                  <span className="text-3xl font-black text-amber-500">₹{totalAmount}</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedSeats.length === 0 || !selectedCinema}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl transition-all text-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Ticket size={20}/> Proceed to Payment
                </button>
                {selectedSeats.length === 0 && (
                  <p className="text-center text-xs text-slate-600 mt-3">Select seats to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}