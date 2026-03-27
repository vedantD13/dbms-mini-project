import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, CreditCard, Film } from 'lucide-react';
import TicketReceipt from '../components/TicketReceipt'; 
import MovieCard from '../components/MovieCard'; // Reusing our awesome movie card!

export default function Dashboard() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  // User's Booking History
  const bookings = [
    {
      id: "BK9824XA",
      movie: "Interstellar",
      format: "IMAX 3D • English",
      cinema: "INOX: R-City Mall",
      date: "Tomorrow, 7:30 PM",
      time: "7:30 PM",
      seats: "J12, J13",
      amount: "₹550",
      status: "Upcoming",
      poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  // Live Movies available for Quick Booking
  const nowShowingMovies = [
    { id: 1, title: "Interstellar", genre: "Sci-Fi", rating: "9.2", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop", videoUrl: "https://cdn.pixabay.com/video/2020/04/18/36551-413123381_tiny.mp4" },
    { id: 2, title: "Dune: Part Two", genre: "Action", rating: "8.8", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop", videoUrl: "https://cdn.pixabay.com/video/2021/08/13/84904-587140837_tiny.mp4" },
    { id: 3, title: "Oppenheimer", genre: "Drama", rating: "8.9", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop", videoUrl: "https://cdn.pixabay.com/video/2019/11/14/29037-372990474_tiny.mp4" },
    { id: 4, title: "The Dark Knight", genre: "Action", rating: "9.0", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2028&auto=format&fit=crop", videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40141-424610191_tiny.mp4" }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-6 relative pb-20">
      
      {/* Premium Ticket Modal Overlay */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-md p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="my-auto py-10 w-full">
               <TicketReceipt booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-400">Manage your tickets and discover new releases.</p>
        </motion.div>

        {/* TOP SECTION: History & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Ticket className="text-red-500" /> Your Bookings
            </h2>
            
            {bookings.map((booking, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-colors shadow-lg">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{booking.movie}</h3>
                    {booking.status === "Upcoming" && <span className="bg-green-500/20 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Upcoming</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{booking.format}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1"><Clock size={16} /> {booking.date.split(',')[0]}</span>
                    <span>Seats: {booking.seats}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(booking)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-medium transition-colors whitespace-nowrap border border-gray-700"
                >
                  View Ticket
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CreditCard className="text-red-500" /> Account Stats
            </h2>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span className="text-gray-400">Total Bookings</span>
                <span className="font-bold text-xl">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reward Points</span>
                <span className="font-bold text-xl text-yellow-500">150</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Quick Booking Grid */}
        <div className="space-y-8 pt-8 border-t border-gray-900">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Film className="text-red-500" /> Now Showing
            <span className="text-sm font-normal text-gray-500 ml-auto bg-gray-900 px-3 py-1 rounded-full border border-gray-800 hidden sm:block">
              Quick Book
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {nowShowingMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}