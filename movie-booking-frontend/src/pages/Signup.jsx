import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext'; 

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();
  
  // 🔥 Pull the real register function from our global brain
  const { register } = useBooking(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // 🚀 Run the real registration logic
      register(formData.fullName, formData.email, formData.password);
      
      toast.success("Account created successfully!");
      navigate('/dashboard'); // Auto-login routes to dashboard
    } catch (error) {
      toast.error(error.message); // Will fire if email is already taken
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans flex-row-reverse">
      {/* Right Side - Cinematic Image (Reversed so it feels different from Login) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-transparent to-slate-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop" 
          alt="Cinema Seats" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-slate-900/80 p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Create an Account</h2>
            <p className="text-slate-400 text-sm">Join CineSync to start booking your favorite movies.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" name="fullName" onChange={handleChange} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" name="email" onChange={handleChange} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="tel" name="phone" onChange={handleChange} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" name="password" onChange={handleChange} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 mt-6 rounded-xl font-bold transition-all duration-200 ease-out hover:-translate-y-[2px] shadow-lg shadow-amber-500/20 active:translate-y-0 active:scale-[0.98]">
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-bold transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}