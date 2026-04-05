import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, History, Settings, PlayCircle, Film, Play, X, User, LogOut, MapPin, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const { movies, currentUser, logout, updateProfile, userBookings, fetchUserBookings } = useBooking();
  const navigate = useNavigate();

  // Normalize any date value to a local YYYY-MM-DD string
  // Handles: "2026-04-05", "2026-04-04T18:30:00.000Z", Date objects, null
  const today = new Date();
  const todayStr = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');

  const normalizeDate = (val) => {
    if (!val) return todayStr;
    // Already YYYY-MM-DD? Return as-is
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // ISO timestamp or Date object → convert to local date
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return todayStr;
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };

  const activeTickets = (userBookings || []).filter(b => normalizeDate(b.show_date) >= todayStr);
  const pastTickets   = (userBookings || []).filter(b => normalizeDate(b.show_date) < todayStr);

  // Format a date value for display
  const formatDate = (val, opts) => {
    if (!val) return 'N/A';
    // For plain YYYY-MM-DD strings, parse at noon local to avoid timezone shift
    const dateStr = typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val) ? val + 'T12:00:00' : val;
    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-IN', opts);
  };






  const categories = ['Trending', 'Now Showing', 'Coming Soon', 'Classics'];
  const categorizedMovies = categories.reduce((acc, cat) => {
    acc[cat] = (movies || []).filter(m => (m.category || 'Now Showing') === cat);
    return acc;
  }, {});

  // Hero carousel — first 6 movies rotate automatically
  const heroMovies = movies.slice(0, 6);
  const heroMovie = heroMovies[heroIndex] || null;

  useEffect(() => {
    if (heroMovies.length <= 1 || heroPaused) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroMovies.length), 5000);
    return () => clearInterval(t);
  }, [heroMovies.length, heroPaused]);

  // Re-fetch tickets whenever user opens My Tickets or History tabs
  useEffect(() => {
    if ((activeTab === 'my tickets' || activeTab === 'history') && currentUser?.id) {
      fetchUserBookings(currentUser.id);
    }
  }, [activeTab]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfile(currentUser.id, profileName || currentUser.name);
    toast.success('Profile saved!');
  };

  const handleLogOut = () => {
    logout();
    navigate('/login');
    toast.success('Logged out.');
  };

  const tabs = [
    { id: 'available', label: 'Movies', icon: <PlayCircle size={17}/> },
    { id: 'my tickets', label: 'My Tickets', icon: <Ticket size={17}/> },
    { id: 'history', label: 'History', icon: <History size={17}/> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17}/> },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-50">
      <Helmet><title>My Dashboard | CineSync</title></Helmet>

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#080c14]/90 backdrop-blur-lg border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Film size={16} className="text-slate-950"/>
            </div>
            <span className="text-lg font-black text-white tracking-tight">CineSync</span>
          </div>

          {/* Tab Navigation (centred on desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedTicket(null); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {/* User + Sign Out */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}&backgroundColor=1e293b`}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
              />
              <span className="text-sm font-semibold text-slate-300 max-w-[120px] truncate">{currentUser?.name}</span>
            </div>
            <button
              onClick={handleLogOut}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 bg-slate-900 hover:bg-red-500/10 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut size={13}/> Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex border-t border-slate-800/60 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedTicket(null); }}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors min-w-[70px] ${
                activeTab === tab.id ? 'text-amber-500 border-t-2 border-amber-500' : 'text-slate-500'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── TRAILER MODAL ── */}
      <AnimatePresence>
        {activeTrailer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
              <button onClick={() => setActiveTrailer(null)} className="absolute top-4 right-4 z-10 bg-slate-900/60 hover:bg-amber-500 text-white hover:text-slate-950 p-2.5 rounded-full transition-colors backdrop-blur-md">
                <X size={20}/>
              </button>
              <iframe width="100%" height="100%" src={`${activeTrailer}?autoplay=1`} title="Movie Trailer" frameBorder="0" allowFullScreen className="w-full h-full"/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-16 pb-16">

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

            {/* ═══ MOVIES TAB ═══ */}
            {activeTab === 'available' && (
              <div>
                {/* ── Auto-Sliding Hero Carousel ── */}
                {heroMovies.length > 0 && heroMovie && (
                  <div
                    className="relative w-full h-[360px] md:h-[440px] rounded-3xl overflow-hidden mb-12 mt-4 border border-slate-800/60 shadow-2xl select-none"
                    onMouseEnter={() => setHeroPaused(true)}
                    onMouseLeave={() => setHeroPaused(false)}
                  >
                    {/* Crossfade Background Image */}
                    <AnimatePresence mode="sync">
                      <motion.img
                        key={`bg-${heroMovie.id}`}
                        src={heroMovie.poster_url}
                        alt={heroMovie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: 'center 20%' }}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                      />
                    </AnimatePresence>

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-[#080c14]/65 to-transparent z-10"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent z-10"/>

                    {/* Animated content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`txt-${heroMovie.id}`}
                        className="absolute bottom-10 left-0 p-8 md:p-12 max-w-xl z-20"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                      >
                        <span className="inline-block bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 shadow-lg">
                          ⭐ Featured
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-2xl">
                          {heroMovie.title}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mb-6">
                          {heroMovie.format}&nbsp;&nbsp;·&nbsp;&nbsp;{heroMovie.genre}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {heroMovie.trailer_url && (
                            <button
                              onClick={() => setActiveTrailer(heroMovie.trailer_url)}
                              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md transition-all"
                            >
                              <Play size={14} className="fill-amber-400 text-amber-400"/> Trailer
                            </button>
                          )}
                          <Link
                            to={`/buytickets/${heroMovie.id}`}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-amber-500/30"
                          >
                            <Ticket size={14}/> Book Now
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Left / Right Arrows */}
                    {heroMovies.length > 1 && (
                      <>
                        <button
                          onClick={() => { setHeroIndex(i => (i - 1 + heroMovies.length) % heroMovies.length); setHeroPaused(false); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-950/60 hover:bg-amber-500 backdrop-blur-sm text-white hover:text-slate-950 rounded-full flex items-center justify-center transition-all border border-white/10"
                        >
                          <ChevronLeft size={18}/>
                        </button>
                        <button
                          onClick={() => { setHeroIndex(i => (i + 1) % heroMovies.length); setHeroPaused(false); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-950/60 hover:bg-amber-500 backdrop-blur-sm text-white hover:text-slate-950 rounded-full flex items-center justify-center transition-all border border-white/10"
                        >
                          <ChevronRight size={18}/>
                        </button>
                      </>
                    )}

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                      {heroMovies.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setHeroIndex(i); setHeroPaused(false); }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'bg-amber-500 w-7' : 'bg-white/30 w-1.5 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>

                    {/* Progress bar */}
                    {!heroPaused && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 z-30">
                        <motion.div
                          className="h-full bg-amber-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 5, ease: 'linear' }}
                          key={`prog-${heroIndex}`}
                        />
                      </div>
                    )}
                  </div>
                )}


                {/* Movie Category Rows */}
                <div className="space-y-10">
                  {categories.map((category) => {
                    const categoryMovies = categorizedMovies[category];
                    if (!categoryMovies || categoryMovies.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-1 h-6 bg-amber-500 rounded-full"/>
                          <h2 className="text-lg font-black text-white">{category}</h2>
                          <span className="text-xs text-slate-600 font-medium ml-1">{categoryMovies.length} films</span>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-4 -mx-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
                          {categoryMovies.map((movie) => (
                            <div
                              key={movie.id}
                              className="group relative shrink-0 w-[160px] md:w-[185px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/60 cursor-pointer"
                              style={{ scrollSnapAlign: 'start' }}
                            >
                              {/* Poster */}
                              <div className="aspect-[2/3] overflow-hidden">
                                <img
                                  src={movie.poster_url}
                                  alt={movie.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              {/* Format badge */}
                              <div className="absolute top-2.5 left-2.5">
                                <span className="text-[9px] font-black text-amber-400 bg-slate-950/80 backdrop-blur-sm border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                  {movie.format}
                                </span>
                              </div>
                              {/* Info + Actions overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                                <div className="p-4">
                                  <p className="text-white font-black text-sm leading-tight mb-0.5 line-clamp-2">{movie.title}</p>
                                  <p className="text-slate-400 text-[10px] font-medium mb-3">{movie.genre}</p>
                                  <div className="flex flex-col gap-1.5">
                                    {movie.trailer_url && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setActiveTrailer(movie.trailer_url); }}
                                        className="w-full bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <Play size={12} className="fill-amber-500 text-amber-500"/> Trailer
                                      </button>
                                    )}
                                    <Link
                                      to={`/buytickets/${movie.id}`}
                                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <Ticket size={12}/> Book Tickets
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              {/* Static title below poster (visible without hover) */}
                              <div className="p-3 border-t border-slate-800/60">
                                <p className="text-white font-bold text-xs leading-tight line-clamp-1">{movie.title}</p>
                                <p className="text-slate-500 text-[10px] mt-0.5">{movie.genre}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {movies.length === 0 && (
                    <div className="text-center py-24 text-slate-600">
                      <Film size={56} className="mx-auto mb-4 opacity-30"/>
                      <p className="font-bold text-lg">No movies yet</p>
                      <p className="text-sm mt-1">Ask an admin to add movies to the database.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ MY TICKETS TAB ═══ */}
            {activeTab === 'my tickets' && (
              <div className="pt-6">
                {!selectedTicket && (
                  <>
                    <h2 className="text-2xl font-black mb-6">Active Bookings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {activeTickets.length === 0 ? (
                        <div className="col-span-3 text-center py-24 text-slate-600">
                          <Ticket size={56} className="mx-auto mb-4 opacity-30"/>
                          <p className="font-bold text-lg">No active bookings</p>
                          <p className="text-sm mt-1">Book some tickets to see them here.</p>
                          <button onClick={() => setActiveTab('available')} className="mt-6 bg-amber-500 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm">Browse Movies</button>
                        </div>
                      ) : activeTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="cursor-pointer bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 hover:border-amber-500/30 transition-all duration-200"
                        >
                          <div className="h-28 relative">
                            <img src={ticket.backdrop} className="w-full h-full object-cover opacity-40"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"/>
                            <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                              {ticket.seats_booked.length} {ticket.seats_booked.length === 1 ? 'Seat' : 'Seats'}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-black text-white text-base mb-1 leading-tight">{ticket.movie}</h3>
                            <p className="text-amber-500 text-xs font-bold mb-3">
                              {formatDate(ticket.show_date, { weekday: 'short', day: '2-digit', month: 'short' })} · {ticket.show_time}
                            </p>
                            <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 text-xs">
                              <div>
                                <p className="text-slate-500 mb-0.5">Seats</p>
                                <p className="font-bold text-white">{ticket.seats_booked.join(', ')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-500 mb-0.5">Cinema</p>
                                <p className="font-bold text-white truncate max-w-[110px]">{ticket.cinema}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Expanded Ticket Detail ── */}
                {selectedTicket && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-full"
                    >
                      <ArrowLeft size={15}/> Back to My Tickets
                    </button>

                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                      {/* Backdrop hero */}
                      <div className="h-48 md:h-64 relative">
                        <img src={selectedTicket.backdrop} className="w-full h-full object-cover opacity-50"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"/>
                        <div className="absolute bottom-5 left-6 md:left-8">
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow mb-2 inline-block">
                            Admit {selectedTicket.seats_booked.length}
                          </span>
                          <h2 className="text-3xl md:text-4xl font-black text-white">{selectedTicket.movie}</h2>
                          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5"><Film size={13} className="text-amber-500"/> {selectedTicket.genre}</p>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Location & Map */}
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2"><MapPin size={15} className="text-amber-500"/> Theater Location</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/60 border border-slate-800/60 p-4 rounded-2xl gap-4">
                              <div>
                                <p className="font-bold text-white">{selectedTicket.cinema}</p>
                                <p className="text-sm text-slate-400 mt-0.5">{selectedTicket.location}</p>
                              </div>
                              <button
                                onClick={() => setShowMap(!showMap)}
                                className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                              >
                                {showMap ? 'Hide Map' : 'View on Map'}
                                <ChevronDown size={14} className={`transition-transform ${showMap ? 'rotate-180 text-amber-500' : 'text-slate-400'}`}/>
                              </button>
                            </div>
                            <AnimatePresence>
                              {showMap && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 300, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden rounded-2xl border border-slate-800 relative z-0 mt-3">
                                  <CinemaMap cinemaName={selectedTicket.cinema} location={selectedTicket.location}/>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Show Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                              { label: 'Date', value: formatDate(selectedTicket.show_date, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) },
                              { label: 'Time', value: selectedTicket.show_time },
                              { label: 'Seats', value: selectedTicket.seats_booked.join(', ') },
                            ].map(item => (
                              <div key={item.label} className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-2xl">
                                <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                                <p className="font-black text-white text-sm break-words">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: QR Code */}
                        <div className="lg:col-span-1">
                          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-6 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Entry Pass</p>
                            <div className="bg-white p-3 rounded-2xl mx-auto w-40 h-40 mb-4 shadow-inner">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.id}`} alt="QR" className="w-full h-full object-contain"/>
                            </div>
                            <p className="font-mono text-xs text-slate-500 tracking-widest">{selectedTicket.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ═══ HISTORY TAB ═══ */}
            {activeTab === 'history' && (
              <div className="pt-6">
                <h2 className="text-2xl font-black mb-6">Past Bookings</h2>
                {pastTickets.length === 0 ? (
                  <div className="text-center py-24 text-slate-600">
                    <History size={56} className="mx-auto mb-4 opacity-30"/>
                    <p className="font-bold text-lg">No past bookings</p>
                    <p className="text-sm mt-1">Completed shows will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastTickets.map(ticket => (
                      <div key={ticket.id} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-800">
                            <img src={ticket.backdrop} className="w-full h-full object-cover"/>
                          </div>
                          <div>
                            <h4 className="font-black text-white text-sm">{ticket.movie}</h4>
                            <p className="text-slate-500 text-xs mt-0.5">{ticket.cinema} · {formatDate(ticket.show_date, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p className="text-slate-600 text-xs mt-0.5">{ticket.seats_booked.join(', ')}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-amber-500 font-black text-base">₹{ticket.total_amount}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{ticket.seats_booked.length} {ticket.seats_booked.length === 1 ? 'seat' : 'seats'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ SETTINGS TAB ═══ */}
            {activeTab === 'settings' && (
              <div className="pt-6 max-w-3xl">
                <h2 className="text-2xl font-black mb-6">Account Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Profile Card */}
                  <div className="md:col-span-1 bg-slate-900 border border-slate-800/60 rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 mb-4 shadow-xl">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}&backgroundColor=1e293b`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-black text-white text-lg">{currentUser?.name}</h3>
                    <p className="text-slate-500 text-sm mt-1 break-all">{currentUser?.email}</p>
                    <div className="mt-4 flex gap-2 text-xs">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">{currentUser?.status}</span>
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold">{currentUser?.role}</span>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="md:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-widest">
                      <User size={14} className="text-amber-500"/> Edit Profile
                    </h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          defaultValue={currentUser?.name}
                          onChange={e => setProfileName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          defaultValue={currentUser?.email}
                          disabled
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-600 cursor-not-allowed opacity-60"
                        />
                        <p className="text-xs text-slate-600 mt-1.5">Email cannot be changed after registration.</p>
                      </div>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 mt-2"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}