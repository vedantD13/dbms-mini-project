import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Clapperboard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Action', 'Sci-Fi', 'IMAX', 'Comedy'];
  
  // Mock Data
  const movies = [
    { id: 1, title: "Interstellar", genre: "Sci-Fi", format: "IMAX", rating: "9.5", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&q=80" },
    { id: 2, title: "Dune: Part Two", genre: "Action", format: "IMAX", rating: "9.2", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80" },
    { id: 3, title: "Deadpool & Wolverine", genre: "Comedy", format: "3D", rating: "8.8", image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=500&q=80" },
  ];

  // Simulate Network Request
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredMovies = activeFilter === 'All' 
    ? movies 
    : movies.filter(m => m.genre === activeFilter || m.format === activeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-28 pb-12 px-6">
      <Helmet><title>Discover Movies | CineSync</title></Helmet>
      
      <div className="container mx-auto max-w-7xl">
        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar mb-8">
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ease-out ${activeFilter === filter ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden animate-pulse">
                <div className="w-full aspect-[2/3] bg-slate-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <div className="relative w-full aspect-[2/3] overflow-hidden">
                  <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <Star w={12} h={12} className="fill-amber-500" /> {movie.rating}
                  </div>
                </div>
                <div className="absolute bottom-0 w-full p-5">
                  <p className="text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">{movie.format} • {movie.genre}</p>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">{movie.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clapperboard w={64} h={64} className="text-slate-800 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">No Movies Found</h2>
            <p className="text-slate-500">Try selecting a different genre or format filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}