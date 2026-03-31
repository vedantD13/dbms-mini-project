import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Ticket className="text-amber-500 w-8 h-8 transition-transform group-hover:rotate-12 duration-300 ease-out" />
          <span className="text-2xl font-black text-white tracking-tight">Cine<span className="text-amber-500">Sync</span></span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search movies, genres, theaters..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Auth Navigation */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors hidden sm:block">
                  Admin Panel
                </Link>
              )}
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-full border border-slate-800 hover:border-slate-700">
                <User w={16} h={16} /> <span className="hidden sm:block">{user?.name || "Dashboard"}</span>
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                <LogOut w={18} h={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm font-bold bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}