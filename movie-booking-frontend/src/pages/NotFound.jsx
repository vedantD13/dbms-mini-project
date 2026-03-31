import { Link } from 'react-router-dom';
import { TicketX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50 text-center px-6">
      <TicketX size={80} className="text-amber-500 mb-6 opacity-80" />
      <h1 className="text-5xl font-black mb-4 tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-slate-300 mb-2">Lost in the Multiverse?</h2>
      <p className="text-slate-500 max-w-md mb-8">
        The page you are looking for doesn't exist, has been moved, or is currently playing in another dimension.
      </p>
      <Link 
        to="/" 
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-8 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
      >
        Return to Home Screen
      </Link>
    </div>
  );
}