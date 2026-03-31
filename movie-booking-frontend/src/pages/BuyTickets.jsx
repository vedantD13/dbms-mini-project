import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, cinemas, currentUser, createBooking } = useBooking();
  
  const movie = movies.find(m => m.id === parseInt(id));
  const [selectedCinema, setSelectedCinema] = useState(cinemas[0] || null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  if (!movie) return <div className="p-20 text-white text-center">Movie not found.</div>;

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    else setSelectedSeats([...selectedSeats, seatId]);
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return toast.error("Please select at least one seat.");
    const total = selectedSeats.length * 250; // Flat ₹250 per seat for demo

    const bookingData = {
      id: `BK${Date.now()}`, user_id: currentUser.id, movie_id: movie.id, cinema_id: selectedCinema.id,
      show_date: new Date().toISOString().split('T')[0], show_time: "07:30 PM", seats_booked: selectedSeats, total_amount: total
    };

    await createBooking(bookingData);
    toast.success("Tickets Booked Successfully!");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-28 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-amber-500 mb-6 font-bold"><ArrowLeft w={16}/> Back</button>
        <div className="flex flex-col md:flex-row gap-8">
          <img src={movie.poster} alt={movie.title} className="w-64 rounded-2xl shadow-2xl shadow-amber-500/10" />
          <div>
            <h1 className="text-4xl font-black mb-2">{movie.title}</h1>
            <p className="text-slate-400 mb-8">{movie.format} • {movie.genre}</p>
            
            <h3 className="font-bold mb-4 text-amber-500">Select Cinema</h3>
            <div className="flex gap-4 mb-8">
              {cinemas.map(c => (
                <button key={c.id} onClick={() => setSelectedCinema(c)} className={`px-4 py-2 rounded-xl border ${selectedCinema?.id === c.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 text-slate-400'}`}>{c.name}</button>
              ))}
            </div>

            <h3 className="font-bold mb-4 text-amber-500">Select Seats (Screen Here)</h3>
            {selectedCinema && (
              <div className="grid gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {selectedCinema.seatLayout.rows.map(row => (
                  <div key={row} className="flex gap-2 items-center">
                    <span className="w-6 text-xs text-slate-500 font-bold">{row}</span>
                    {Array.from({ length: selectedCinema.seatLayout.cols }).map((_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`w-8 h-8 rounded-t-lg text-[10px] font-bold transition-colors ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{i + 1}</button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-slate-800 pt-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-2xl font-black">₹{selectedSeats.length * 250}</p>
              </div>
              <button onClick={handleCheckout} className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-amber-400 flex items-center gap-2"><CheckCircle w={18}/> Checkout Securely</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}