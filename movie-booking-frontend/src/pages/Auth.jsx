import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useBooking } from '../context/BookingContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // 🔥 Pull the real database functions from our global brain
  const { login, register } = useBooking();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let user;
      
      if (isLogin) {
        // 🚀 AWAIT the real SQL login check
        user = await login(formData.email, formData.password);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        // 🚀 AWAIT the real SQL registration
        user = await register(formData.name, formData.email, formData.password);
        toast.success("Account created successfully!");
      }

      // Smart Routing based on database role
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      // Catches wrong passwords, banned statuses, or duplicate emails!
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden font-sans">
      <Helmet><title>{isLogin ? 'Log In' : 'Sign Up'} | CineSync</title></Helmet>

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=2000&q=80" 
          alt="Cinema Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
      </div>

      {/* Glassmorphism Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-amber-400">
            <Film className="text-slate-950" w={28} h={28} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Join CineSync'}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8 font-medium">
          {isLogin ? 'Enter your credentials to access your account.' : 'Create an account to book premium seats.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    required={!isLogin} type="text" placeholder="Full Name" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-amber-500 outline-none transition-colors font-medium"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              required type="email" placeholder="Email Address" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-amber-500 outline-none transition-colors font-medium"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              required type="password" placeholder="Password" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-amber-500 outline-none transition-colors font-medium"
            />
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 shadow-lg shadow-amber-500/20"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Secure Sign In' : 'Create Account')}
            {!isLoading && <ArrowRight w={18} />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-slate-400 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setFormData({ name: '', email: '', password: '' }); }} 
              className="text-white font-bold hover:text-amber-500 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}