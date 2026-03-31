import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, History, Settings, PlayCircle, Film, Play, X, User, LogOut, MapPin, ChevronDown, Clock, ArrowLeft, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import CinemaMap from '../components/CinemaMap';
import { useBooking } from '../context/BookingContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const [activeTrailer, setActiveTrailer] = useState(null); 
  const [profileName, setProfileName] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  const { movies, currentUser, logout, updateProfile, userBookings } = useBooking(); 
  const navigate = useNavigate();

  // 🔥 FIX: Added "|| []" to prevent the "filter of undefined" crash
  const today = new Date().toISOString().split('T')[0];
  const activeTickets = (userBookings || []).filter(b => b.show_date >= today);
  const pastTickets = (userBookings || []).filter(b => b.show_date < today);

  // 🔥 FIX: Added "|| []" to prevent category filter crash
  const categories = ['Trending', 'Now Showing', 'Coming Soon', 'Classics'];
  const categorizedMovies = categories.reduce((acc, cat) => { 
    acc[cat] = (movies || []).filter(m => (m.category || 'Now Showing') === cat); 
    return acc; 
  }, {});

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfile(currentUser.id, profileName || currentUser.name);
    toast.success('Profile saved to database!');
  };

  const handleLogOut = () => { 
    logout(); 
    navigate('/login'); 
    toast.success('Logged out.'); 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-24 pb-12 px-6 relative">
      <Helmet><title>My Dashboard | CineSync</title></Helmet>

      {/* GLOBAL TOPBAR */}
      <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Film w={18} className="text-slate-950"/></div>
          <span className="text-xl font-black text-white tracking-tight">CineSync</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-300 hidden md:block">Hello, {currentUser?.name}</span>
          <button onClick={handleLogOut} className="bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-slate-400 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2"><LogOut w={14}/> Sign Out</button>
        </div>
      </nav>

      {/* TRAILER MODAL */}
      <AnimatePresence>
        {activeTrailer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(245,158,11,0.2)] border border-slate-800">
              <button onClick={() => setActiveTrailer(null)} className="absolute top-4 right-4 z-10 bg-slate-900/50 hover:bg-amber-500 text-white hover:text-slate-950 p-2 rounded-full transition-colors backdrop-blur-md"><X w={24} h={24} /></button>
              <iframe width="100%" height="100%" src={`${activeTrailer}?autoplay=1`} title="Movie Trailer" frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-black mb-8">My Dashboard</h1>

        <div className="flex gap-2 border-b border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
          {['available', 'my tickets', 'history', 'settings'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelectedTicket(null); }} className={`px-6 py-3 text-sm font-bold capitalize transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab === 'available' && <PlayCircle w={16} h={16}/>}{tab === 'my tickets' && <Ticket w={16} h={16}/>}{tab === 'history' && <History w={16} h={16}/>}{tab === 'settings' && <Settings w={16} h={16}/>}{tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            
            {/* MOVIES TAB */}
            {activeTab === 'available' && (
              <div className="space-y-12">
                {categories.map((category) => {
                  const categoryMovies = categorizedMovies[category];
                  if (categoryMovies.length === 0) return null; 
                  return (
                    <div key={category} className="space-y-4">
                      <h2 className="text-xl font-black text-white flex items-center gap-2 border-l-4 border-amber-500 pl-3">{category}</h2>
                      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar snap-x snap-mandatory">
                        {categoryMovies.map((movie) => (
                          <div key={movie.id} className="group relative w-64 md:w-72 shrink-0 aspect-[2/3] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] snap-start">
                            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                            <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-slate-950/80 to-transparent">
                              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-slate-950/50 backdrop-blur-md px-2 py-1 rounded w-fit">{movie.format}</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 translate-y-4 group-hover:translate-y-0">
                              <h3 className="text-xl font-black text-white mb-1">{movie.title}</h3>
                              <p className="text-xs font-bold text-slate-400 mb-4">{movie.genre}</p>
                              <div className="flex flex-col gap-2">
                                {movie.trailerUrl && (<button onClick={() => setActiveTrailer(movie.trailerUrl)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"><Play w={16} className="fill-amber-500 text-amber-500" /> Watch Trailer</button>)}
                                <Link to={`/buytickets/${movie.id}`} className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"><Ticket w={16} /> Book Tickets</Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MY TICKETS TAB */}
            {activeTab === 'my tickets' && (
              <div>
                {!selectedTicket && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTickets.length === 0 ? <p className="text-slate-500 col-span-3 text-center py-12">No active bookings.</p> : 
                     activeTickets.map(ticket => (
                      <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="cursor-pointer bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative hover:-translate-y-1 transition-transform">
                        <div className="h-32 relative"><img src={ticket.backdrop} className="w-full h-full object-cover opacity-50"/><div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div></div>
                        <div className="p-6 relative">
                          <div className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full absolute -top-4 right-6 shadow-lg">Admit {ticket.seats_booked.length}</div>
                          <h3 className="text-xl font-black text-white mb-1">{ticket.movie}</h3>
                          <p className="text-sm font-medium text-amber-500 mb-4">{new Date(ticket.show_date).toLocaleDateString()} • {ticket.show_time}</p>
                          <div className="flex justify-between items-end border-t border-dashed border-slate-800 pt-4 mt-2">
                             <div><p className="text-xs text-slate-500">Seats</p><p className="font-bold text-white">{ticket.seats_booked.join(', ')}</p></div>
                             <div className="text-right"><p className="text-xs text-slate-500">Cinema</p><p className="font-bold text-white text-sm max-w-[120px] truncate">{ticket.cinema}</p></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXPANDED TICKET VIEW */}
                {selectedTicket && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-full w-fit">
                      <ArrowLeft w={16} h={16} /> Back to My Tickets
                    </button>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                      <div className="absolute top-0 w-full h-80 opacity-30 pointer-events-none">
                        <img src={selectedTicket.backdrop} alt="Backdrop" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900"></div>
                      </div>
                      <div className="relative z-10 p-6 md:p-10">
                        <div className="mb-10">
                          <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Admit {selectedTicket.seats_booked.length}</div>
                          <h2 className="text-4xl md:text-5xl font-black mb-3">{selectedTicket.movie}</h2>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300">
                            <span className="flex items-center gap-1.5"><Film w={16} h={16} className="text-amber-500"/> {selectedTicket.genre}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                          <div className="lg:col-span-2 space-y-8">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-3">Theater Location</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 shrink-0"><MapPin className="text-amber-500" w={20} h={20} /></div>
                                  <div><p className="font-bold text-white text-lg">{selectedTicket.cinema}</p><p className="text-sm text-slate-400 mt-1">{selectedTicket.location}</p></div>
                                </div>
                                <button onClick={() => setShowMap(!showMap)} className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                  {showMap ? 'Hide Map' : 'View on Map'} <ChevronDown className={`w-4 h-4 transition-transform ${showMap ? 'rotate-180 text-amber-500' : 'text-slate-400'}`} />
                                </button>
                              </div>
                              <AnimatePresence>
                                {showMap && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 320, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden rounded-2xl border border-slate-800 relative z-0 mt-4">
                                    <CinemaMap cinemaName={selectedTicket.cinema} location={selectedTicket.location} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <div className="lg:col-span-1">
                            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                              <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Booking ID: {selectedTicket.id}</h3>
                              <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 mb-8 border-4 border-slate-800 shadow-inner">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.id}`} alt="Entry QR" className="w-full h-full object-contain" />
                              </div>
                              <div className="space-y-4 border-t border-dashed border-slate-800 pt-6">
                                <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Date</span><span className="text-white font-bold">{new Date(selectedTicket.show_date).toLocaleDateString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Time</span><span className="text-white font-bold">{selectedTicket.show_time}</span></div>
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-800"><span className="text-slate-500 text-sm">Seats</span><span className="text-2xl font-black text-amber-500 text-right">{selectedTicket.seats_booked.join(', ')}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {pastTickets.length === 0 ? <div className="text-center py-20 text-slate-500"><History w={48} className="mx-auto mb-4 opacity-50"/>No Past Bookings</div> : 
                 pastTickets.map(ticket => (
                  <div key={ticket.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center opacity-70">
                    <div><h4 className="font-bold text-white">{ticket.movie}</h4><p className="text-xs text-slate-400">{new Date(ticket.show_date).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="text-sm text-amber-500 font-bold">₹{ticket.total_amount}</p><p className="text-xs text-slate-500">{ticket.seats_booked.length} Seats</p></div>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center shadow-xl">
                    <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-950 mb-4 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}&backgroundColor=f59e0b`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-black text-white">{currentUser?.name || 'Guest User'}</h3>
                    <p className="text-sm text-slate-400 mb-6 font-medium">{currentUser?.email}</p>
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 border-b border-slate-800 pb-4 flex items-center gap-2"><User w={18} className="text-amber-500" /> Account Settings</h3>
                    <form className="space-y-5" onSubmit={handleUpdateProfile}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Full Name</label><input type="text" defaultValue={currentUser?.name} onChange={e => setProfileName(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" /></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Email Address</label><input type="email" defaultValue={currentUser?.email} disabled className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 opacity-50 cursor-not-allowed" /></div>
                      </div>
                      <div className="pt-4"><button type="submit" className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">Save Profile</button></div>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}