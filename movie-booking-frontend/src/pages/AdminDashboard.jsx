import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Film, Activity, PlusCircle, MapPin, Trash2, Edit3, ShieldBan, UserX, X, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import CinemaMap from '../components/CinemaMap';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    addCinema, deleteCinema, cinemas, 
    addMovie, movies, deleteMovie, editMovie, 
    users, updateUserStatus, deleteUser 
  } = useBooking();

  const [cinemaForm, setCinemaForm] = useState({
    name: '', premium: 'Standard', location: '', address: '', lat: '', lng: '', numRows: 6, seatsPerRow: 12 
  });
  
  const [movieForm, setMovieForm] = useState({
    title: '', poster: '', genre: 'Action', format: 'IMAX 3D', category: 'Now Showing', trailerUrl: ''
  });

  // Edit Modal States
  const [editingMovie, setEditingMovie] = useState(null);

  // --- Handlers ---
  const handleAddMovie = (e) => {
    e.preventDefault();
    let finalTrailerUrl = movieForm.trailerUrl.includes('watch?v=') ? movieForm.trailerUrl.replace('watch?v=', 'embed/') : movieForm.trailerUrl;
    addMovie({ ...movieForm, trailerUrl: finalTrailerUrl });
    toast.success(`"${movieForm.title}" published!`);
    setMovieForm({ title: '', poster: '', genre: 'Action', format: 'IMAX 3D', category: 'Now Showing', trailerUrl: '' }); 
  };

  const handleUpdateMovie = (e) => {
    e.preventDefault();
    let finalTrailerUrl = editingMovie.trailerUrl.includes('watch?v=') ? editingMovie.trailerUrl.replace('watch?v=', 'embed/') : editingMovie.trailerUrl;
    editMovie(editingMovie.id, { ...editingMovie, trailerUrl: finalTrailerUrl });
    toast.success("Movie updated successfully!");
    setEditingMovie(null);
  };

  const handleAddCinema = (e) => {
    e.preventDefault();
    if (!cinemaForm.lat || !cinemaForm.lng) return toast.error("Please click on the map to set the location.");
    
    const generatedRows = Array.from({ length: parseInt(cinemaForm.numRows) }, (_, i) => String.fromCharCode(65 + i)); 
    addCinema({
      name: cinemaForm.name, location: cinemaForm.location, address: cinemaForm.address, lat: cinemaForm.lat, lng: cinemaForm.lng, premium: cinemaForm.premium,
      seatLayout: {
        rows: generatedRows, cols: parseInt(cinemaForm.seatsPerRow), aisleAfter: Math.floor(parseInt(cinemaForm.seatsPerRow) / 2), 
        pricing: { VIP: generatedRows.slice(0, 1), Premium: generatedRows.slice(1, 3), Standard: generatedRows.slice(3) }
      }
    });
    toast.success(`${cinemaForm.name} registered!`);
    setCinemaForm({ name: '', premium: 'Standard', location: '', address: '', lat: '', lng: '', numRows: 6, seatsPerRow: 12 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-28 pb-12 px-6 relative">
      <Helmet><title>Admin Panel | CineSync</title></Helmet>

      {/* 🔥 FULL-SCREEN MOVIE EDIT MODAL */}
      <AnimatePresence>
        {editingMovie && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative">
              <button onClick={() => setEditingMovie(null)} className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition"><X w={20}/></button>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><Edit3 className="text-amber-500"/> Edit Movie</h3>
              
              <form onSubmit={handleUpdateMovie} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Movie Title</label>
                    <input required value={editingMovie.title} onChange={e => setEditingMovie({...editingMovie, title: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Poster URL</label>
                    <input required value={editingMovie.poster} onChange={e => setEditingMovie({...editingMovie, poster: e.target.value})} type="url" className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">YouTube Trailer URL</label>
                    <input value={editingMovie.trailerUrl} onChange={e => setEditingMovie({...editingMovie, trailerUrl: e.target.value})} type="url" className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                    <select value={editingMovie.category} onChange={e => setEditingMovie({...editingMovie, category: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white">
                      <option value="Trending">Trending</option><option value="Now Showing">Now Showing</option><option value="Coming Soon">Coming Soon</option><option value="Classics">Classics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Format</label>
                    <select value={editingMovie.format} onChange={e => setEditingMovie({...editingMovie, format: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white">
                      <option value="IMAX 3D">IMAX 3D</option><option value="Standard 2D">Standard 2D</option><option value="4DX">4DX</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-amber-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors">Save Changes</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-8 bg-amber-500 rounded-full"></div>
          <h1 className="text-3xl font-black">Admin Portal</h1>
        </div>

        <div className="flex gap-2 border-b border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
          {['overview', 'movies', 'cinemas', 'users'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-bold capitalize transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab === 'overview' && <Activity w={16} h={16}/>}{tab === 'movies' && <Film w={16} h={16}/>}{tab === 'cinemas' && <MapPin w={16} h={16}/>}{tab === 'users' && <Users w={16} h={16}/>}{tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl"><Users className="text-indigo-500 mb-4" /><p className="text-slate-400 text-sm font-bold uppercase">Total Users</p><p className="text-4xl font-black">{users.length}</p></div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl"><Film className="text-amber-500 mb-4" /><p className="text-slate-400 text-sm font-bold uppercase">Active Shows</p><p className="text-4xl font-black">{movies.length}</p></div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-900/20"><Activity className="text-emerald-500 mb-4" /><p className="text-slate-400 text-sm font-bold uppercase">Today's Revenue</p><p className="text-4xl font-black">₹45,500</p></div>
               </div>
            )}

            {/* 🔥 REDESIGNED MOVIES TAB */}
            {activeTab === 'movies' && (
              <div className="flex flex-col xl:flex-row gap-8">
                <div className="w-full xl:w-4/12 bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit shadow-lg">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PlusCircle w={18} className="text-amber-500" /> Publish Movie</h3>
                  <form onSubmit={handleAddMovie} className="space-y-4">
                    <input required value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} type="text" placeholder="Movie Title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                    <input required value={movieForm.poster} onChange={e => setMovieForm({...movieForm, poster: e.target.value})} type="url" placeholder="Poster URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                    <input value={movieForm.trailerUrl} onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} type="url" placeholder="YouTube Trailer URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                    <div className="grid grid-cols-2 gap-3">
                      <select required value={movieForm.category} onChange={e => setMovieForm({...movieForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-white"><option value="Trending">Trending</option><option value="Now Showing">Now Showing</option><option value="Coming Soon">Coming Soon</option><option value="Classics">Classics</option></select>
                      <select required value={movieForm.format} onChange={e => setMovieForm({...movieForm, format: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-white"><option value="IMAX 3D">IMAX 3D</option><option value="Standard 2D">Standard 2D</option><option value="4DX">4DX</option></select>
                    </div>
                    <button type="submit" className="w-full mt-2 bg-amber-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg">Add to Database</button>
                  </form>
                </div>

                <div className="w-full xl:w-8/12 space-y-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Film className="text-indigo-500"/> Movie Database</h3>
                  {movies.length === 0 ? <p className="text-slate-500 p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">No movies added.</p> : 
                    movies.map((movie) => (
                      <div key={movie.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg shadow-md border border-slate-700" />
                          <div>
                            <h4 className="text-lg font-bold text-white leading-tight">{movie.title}</h4>
                            <div className="flex gap-2 mt-1">
                              <span className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{movie.format}</span>
                              <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-amber-500/20">{movie.category || 'Now Showing'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingMovie(movie)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="Edit Full Details"><Edit3 w={16} h={16} /></button>
                          <button onClick={() => { if(window.confirm(`Delete ${movie.title}?`)) { deleteMovie(movie.id); toast.success("Deleted.");} }} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition" title="Delete"><Trash2 w={16} h={16} /></button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* 🔥 REDESIGNED CINEMAS TAB */}
            {activeTab === 'cinemas' && (
              <div className="space-y-8">
                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="w-full xl:w-1/2 h-[500px] relative z-0">
                    <CinemaMap interactive={true} onLocationSelect={(geo) => setCinemaForm(p => ({ ...p, lat: geo.lat, lng: geo.lng, location: geo.location, address: geo.address }))} />
                  </div>
                  <div className="w-full xl:w-1/2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin w={18} className="text-amber-500" /> Register Cinema</h3>
                    <form onSubmit={handleAddCinema} className="space-y-4">
                      <input required value={cinemaForm.name} onChange={e => setCinemaForm({...cinemaForm, name: e.target.value})} type="text" placeholder="Cinema Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                      <div className="grid grid-cols-2 gap-4">
                        <input required value={cinemaForm.location} onChange={e => setCinemaForm({...cinemaForm, location: e.target.value})} type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-white bg-amber-500/5" placeholder="City (Click Map)" />
                        <input disabled value={cinemaForm.lat ? `${cinemaForm.lat.toFixed(4)}, ${cinemaForm.lng.toFixed(4)}` : ''} type="text" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" placeholder="Coordinates" />
                      </div>
                      <textarea required value={cinemaForm.address} onChange={e => setCinemaForm({...cinemaForm, address: e.target.value})} rows="2" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-white resize-none bg-amber-500/5" placeholder="Address (Click Map)"></textarea>
                      <div className="grid grid-cols-3 gap-3">
                        <input required value={cinemaForm.numRows} onChange={e => setCinemaForm({...cinemaForm, numRows: e.target.value})} type="number" placeholder="Rows" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                        <input required value={cinemaForm.seatsPerRow} onChange={e => setCinemaForm({...cinemaForm, seatsPerRow: e.target.value})} type="number" placeholder="Seats/Row" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                        <select required value={cinemaForm.premium} onChange={e => setCinemaForm({...cinemaForm, premium: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-3 text-sm outline-none text-white"><option value="Standard">Standard</option><option value="IMAX">IMAX</option><option value="Recliners">VIP</option></select>
                      </div>
                      <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors">Add Cinema</button>
                    </form>
                  </div>
                </div>

                {/* Manage Cinemas List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-emerald-500"/> Cinema Network</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cinemas.map(cinema => (
                      <div key={cinema.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative shadow-lg">
                        <button onClick={() => { if(window.confirm(`Remove ${cinema.name}?`)) deleteCinema(cinema.id); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition"><Trash2 w={18}/></button>
                        <h4 className="text-xl font-black text-white mb-1 pr-8">{cinema.name}</h4>
                        <p className="text-sm text-slate-400 mb-4 flex items-center gap-1"><MapPin w={14}/> {cinema.location}</p>
                        <div className="flex gap-2 text-xs font-bold">
                          <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">{cinema.seatLayout.rows.length * cinema.seatLayout.cols} Seats</span>
                          <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">{cinema.premium}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 🔥 REDESIGNED USERS TAB WITH BAN & BLACKLIST */}
            {activeTab === 'users' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Users className="text-indigo-500"/> User Management</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr><th className="p-5">User</th><th className="p-5">Role</th><th className="p-5">Status</th><th className="p-5 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-base">{user.name}</span>
                              <span className="text-xs text-slate-500">{user.email}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'Admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-300'}`}>{user.role}</span>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : user.status === 'Banned' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                              {user.status === 'Active' && <CheckCircle2 w={12}/>}
                              {user.status === 'Banned' && <ShieldBan w={12}/>}
                              {user.status === 'Blacklisted' && <UserX w={12}/>}
                              {user.status}
                            </span>
                          </td>
                          <td className="p-5 flex justify-end gap-2">
                            {user.status !== 'Active' && (
                              <button onClick={() => updateUserStatus(user.id, 'Active')} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition" title="Restore User"><CheckCircle2 w={16}/></button>
                            )}
                            {user.status !== 'Banned' && (
                              <button onClick={() => { updateUserStatus(user.id, 'Banned'); toast.error(`${user.name} banned.`); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition" title="Ban User"><ShieldBan w={16}/></button>
                            )}
                            {user.status !== 'Blacklisted' && (
                              <button onClick={() => { updateUserStatus(user.id, 'Blacklisted'); toast.error(`${user.name} blacklisted.`); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition" title="Blacklist Device"><UserX w={16}/></button>
                            )}
                            <div className="w-px h-6 bg-slate-800 mx-1 mt-1"></div>
                            <button onClick={() => { if(window.confirm(`Permanently delete ${user.name}?`)) deleteUser(user.id); }} className="p-2 text-slate-600 hover:text-red-500 transition" title="Delete Account"><Trash2 w={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}