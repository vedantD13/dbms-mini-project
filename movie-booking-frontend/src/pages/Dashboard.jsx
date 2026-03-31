import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, History, Settings, Calendar, Clock, Film } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import CinemaMap from '../components/CinemaMap';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Enriched Dummy Data: Now includes movie details for the immersive view
  const activeTicket = {
    movie: "Interstellar", 
    date: "Today, Oct 24", 
    time: "09:30 PM", 
    cinema: "CineSync Premium", 
    location: "Mumbai, Maharashtra",
    seats: "C4, C5", 
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BK10293X`,
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=80",
    duration: "2h 49m",
    genre: "Sci-Fi, Adventure, Drama",
    synopsis: "As Earth's future has been riddled by disasters, famines, and droughts, there is only one way to ensure mankind's survival: Interstellar travel. A newly discovered wormhole in the far reaches of our solar system allows a team of astronauts to go where no man has gone before."
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-28 pb-12 px-6">
      <Helmet><title>My Dashboard | CineSync</title></Helmet>
      
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-black mb-8">My Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
          {['upcoming', 'history', 'settings'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold capitalize transition-colors flex items-center gap-2 border-b-2 ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'upcoming' && <Ticket w={16} h={16}/>}
              {tab === 'history' && <History w={16} h={16}/>}
              {tab === 'settings' && <Settings w={16} h={16}/>}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {/* IMMERSIVE UPCOMING TICKET VIEW */}
            {activeTab === 'upcoming' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                
                {/* Cinematic Backdrop Image */}
                <div className="absolute top-0 w-full h-80 opacity-30 pointer-events-none">
                  <img src={activeTicket.backdrop} alt="Backdrop" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900"></div>
                </div>

                <div className="relative z-10 p-6 md:p-10">
                  {/* Movie Header Info */}
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      Next Showing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-3">{activeTicket.movie}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300">
                      <span className="flex items-center gap-1.5"><Film w={16} h={16} className="text-amber-500"/> {activeTicket.genre}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Clock w={16} h={16} className="text-amber-500"/> {activeTicket.duration}</span>
                    </div>
                  </div>

                  {/* Two-Column Layout: Details/Map (Left) vs Ticket (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    
                    {/* Left Column: Synopsis & Map */}
                    <div className="lg:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">Synopsis</h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                          {activeTicket.synopsis}
                        </p>
                      </div>

                      {/* GPS Map Component embedded here */}
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">Theater Location</h3>
                        <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-800">
                          <CinemaMap 
                            cinemaName={activeTicket.cinema} 
                            location={activeTicket.location} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: The Ticket Stub */}
                    <div className="lg:col-span-1">
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                        {/* Fake cutout edges for ticket aesthetic */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-r border-slate-800"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-l border-slate-800"></div>
                        
                        <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Admit One</h3>
                        
                        <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 mb-8 border-4 border-slate-800 shadow-inner">
                          <img src={activeTicket.qrUrl} alt="Entry QR" className="w-full h-full object-contain" />
                        </div>

                        <div className="space-y-4 border-t border-dashed border-slate-800 pt-6">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Date</span>
                            <span className="text-white font-bold">{activeTicket.date}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Time</span>
                            <span className="text-white font-bold">{activeTicket.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Theater</span>
                            <span className="text-white font-bold text-right">{activeTicket.cinema}</span>
                          </div>
                          <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-800">
                            <span className="text-slate-500 text-sm">Seats</span>
                            <span className="text-3xl font-black text-amber-500">{activeTicket.seats}</span>
                          </div>
                        </div>

                        <p className="text-center text-slate-600 text-[10px] font-bold uppercase mt-8 tracking-widest">Show at Entrance</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed text-center">
                <History w={48} h={48} className="text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-1">No Past Bookings</h3>
                <p className="text-slate-500 text-sm">Movies you have watched will appear here.</p>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl">
                <h3 className="text-lg font-bold mb-6 border-b border-slate-800 pb-4">Profile Information</h3>
                <form className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue="Demo User" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                    <input type="email" defaultValue="demo@example.com" disabled className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 opacity-50 cursor-not-allowed" />
                  </div>
                  <button type="button" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors">Save Changes</button>
                </form>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}