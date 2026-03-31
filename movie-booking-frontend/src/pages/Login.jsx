import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 👑 HARDCODED ADMIN CHECK
    if (formData.email === 'admin@cinesync.com' && formData.password === 'admin123') {
      login({ name: "System Admin", email: formData.email, role: 'admin' });
      navigate('/admin');
    } else {
      // 👤 REGULAR USER LOGIN
      login({ name: "Demo User", email: formData.email, role: 'user' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex pt-16 font-sans">
      {/* Left Side - Cinematic Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" 
          alt="Cinema" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-slate-900/80 p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md"
        >
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mb-8 text-sm">Sign in to manage your bookings and preferences.</p>

          {/* Admin Hint for Testing */}
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-500/80 font-mono">
            Admin Test: admin@cinesync.com / admin123
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-950 py-4 rounded-xl font-bold transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:translate-y-0 active:scale-[0.98] mt-4"
            >
              Secure Sign In <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-500 hover:text-amber-400 font-bold transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}