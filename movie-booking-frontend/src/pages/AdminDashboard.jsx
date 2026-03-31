import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Film, Activity, PlusCircle, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import CinemaMap from '../components/CinemaMap';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { addCinema } = useBooking();

  // State for the Cinema Form
  const [cinemaForm, setCinemaForm] = useState({
    name: '', screens: '', premium: 'Standard', location: '', address: '', lat: '', lng: ''
  });

  const handleAddMovie = (e) => {
    e.preventDefault();
    toast.success("Movie added to database!");
    e.target.reset();
  };

  const handleAddCinema = (e) => {
    e.preventDefault();
    if (!cinemaForm.lat || !cinemaForm.lng) {
      return toast.error("Please click on the map to set the exact location.");
    }
    
    addCinema(cinemaForm);
    toast.success(`${cinemaForm.name} registered successfully!`);
    
    // Reset form
    setCinemaForm({ name: '', screens: '', premium: 'Standard', location: '', address: '', lat: '', lng: '' });
  };

  // When map is clicked, update form state
  const handleMapSelect = (geoData) => {
    setCinemaForm(prev => ({
      ...prev,
      lat: geoData.lat,
      lng: geoData.lng,
      location: geoData.location,
      address: geoData.address
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-28 pb-12 px-6">
      <Helmet><title>Admin Panel | CineSync</title></Helmet>
      
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-8 bg-amber-500 rounded-full"></div>
          <h1 className="text-3xl font-black">Admin Portal</h1>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 border-b border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
          {['overview', 'movies', 'cinemas', 'users'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold capitalize transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'overview' && <Activity w={16} h={16}/>}
              {tab === 'movies' && <Film w={16} h={16}/>}
              {tab === 'cinemas' && <MapPin w={16} h={16}/>}
              {tab === 'users' && <Users w={16} h={16}/>}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                  <Users className="text-indigo-500 mb-4" />
                  <p className="text-slate-400 text-sm font-bold uppercase">Total Users</p>
                  <p className="text-4xl font-black">1,204</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                  <Film className="text-amber-500 mb-4" />
                  <p className="text-slate-400 text-sm font-bold uppercase">Active Shows</p>
                  <p className="text-4xl font-black">42</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-900/20">
                  <Activity className="text-emerald-500 mb-4" />
                  <p className="text-slate-400 text-sm font-bold uppercase">Today's Revenue</p>
                  <p className="text-4xl font-black">₹45,500</p>
                </div>
               </div>
            )}

            {/* RESTORED: MOVIES TAB WITH FULL FORM */}
            {activeTab === 'movies' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PlusCircle w={18} /> Add New Movie</h3>
                <form onSubmit={handleAddMovie} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Movie Title</label>
                      <input required type="text" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Poster URL</label>
                      <input required type="url" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Genre</label>
                      <select required className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white appearance-none transition-colors">
                        <option value="Action">Action</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Format</label>
                      <select required className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white appearance-none transition-colors">
                        <option value="IMAX 3D">IMAX 3D</option>
                        <option value="Standard 2D">Standard 2D</option>
                        <option value="4DX">4DX</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors">Publish Movie to Database</button>
                </form>
              </div>
            )}

            {/* INTERACTIVE CINEMAS TAB */}
            {activeTab === 'cinemas' && (
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Side: Map Picker */}
                <div className="w-full lg:w-1/2 h-[500px]">
                  <CinemaMap 
                    interactive={true} 
                    onLocationSelect={handleMapSelect} 
                  />
                </div>

                {/* Right Side: Auto-filling Form */}
                <div className="w-full lg:w-1/2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin w={18} className="text-amber-500" /> Register Cinema Location</h3>
                  <form onSubmit={handleAddCinema} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Cinema Name</label>
                        <input required value={cinemaForm.name} onChange={e => setCinemaForm({...cinemaForm, name: e.target.value})} type="text" placeholder="e.g. INOX R-City" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white placeholder:text-slate-600" />
                      </div>
                      
                      {/* These fields auto-fill when map is clicked! */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                        <input required value={cinemaForm.location} onChange={e => setCinemaForm({...cinemaForm, location: e.target.value})} type="text" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white bg-amber-500/5 border-amber-500/30" placeholder="Click map to autofill" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Coordinates</label>
                        <input disabled value={cinemaForm.lat ? `${cinemaForm.lat.toFixed(4)}, ${cinemaForm.lng.toFixed(4)}` : ''} type="text" className="w-full mt-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" placeholder="Click map to autofill" />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Full Address</label>
                        <textarea required value={cinemaForm.address} onChange={e => setCinemaForm({...cinemaForm, address: e.target.value})} rows="2" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white resize-none bg-amber-500/5 border-amber-500/30" placeholder="Click map to autofill..."></textarea>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Total Screens</label>
                        <input required value={cinemaForm.screens} onChange={e => setCinemaForm({...cinemaForm, screens: e.target.value})} type="number" min="1" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Premium Features</label>
                        <select required value={cinemaForm.premium} onChange={e => setCinemaForm({...cinemaForm, premium: e.target.value})} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none text-white appearance-none">
                          <option value="Standard">Standard Only</option>
                          <option value="IMAX">IMAX Equipped</option>
                          <option value="4DX">4DX Equipped</option>
                          <option value="Recliners">VIP Recliners</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full mt-4 bg-amber-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">Add Cinema to Network</button>
                  </form>
                </div>

              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap overflow-x-auto block md:table">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-5">Name</th>
                      <th className="p-5">Email</th>
                      <th className="p-5">Role</th>
                      <th className="p-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-5 font-medium text-white">John Doe</td>
                      <td className="p-5">john@example.com</td>
                      <td className="p-5"><span className="bg-slate-800 px-2 py-1 rounded text-xs">User</span></td>
                      <td className="p-5 text-right text-emerald-500 font-bold">Active</td>
                    </tr>
                    <tr>
                      <td className="p-5 font-medium text-white">System Admin</td>
                      <td className="p-5">admin@cinesync.com</td>
                      <td className="p-5"><span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-xs">Admin</span></td>
                      <td className="p-5 text-right text-emerald-500 font-bold">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}