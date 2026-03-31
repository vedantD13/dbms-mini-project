import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col relative overflow-x-hidden selection:bg-amber-500/30">
      
      <Navbar />
      
      {/* Professional Page Routing Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] // Premium "Apple-style" ease-out curve
          }}
          className="flex-grow w-full"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      
      <Footer />
      
    </div>
  );
}