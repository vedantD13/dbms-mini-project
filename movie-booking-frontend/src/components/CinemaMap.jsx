import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Amber Marker
const customMarker = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to move the map view
function ChangeView({ center }) {
  const map = useMap();
  if (center) map.setView(center, 15, { animate: true });
  return null;
}

// Map Click Handler for Admin
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      if (!onLocationSelect) return;
      const { lat, lng } = e.latlng;
      
      try {
        toast.loading("Fetching address...", { id: 'geo' });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        onLocationSelect({
          lat,
          lng,
          location: data.address.city || data.address.town || data.address.suburb || 'Unknown City',
          address: data.display_name
        });
        toast.success("Location pinpointed!", { id: 'geo' });
      } catch (err) {
        toast.error("Geocoding failed.", { id: 'geo' });
      }
    }
  });
  return null;
}

export default function CinemaMap({ interactive = false, onLocationSelect, center = [19.0760, 72.8777] }) {
  const { cinemas } = useBooking();
  const [mapCenter, setMapCenter] = useState(center);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name, address } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        setMapCenter([newLat, newLng]);

        if (interactive && onLocationSelect) {
          onLocationSelect({
            lat: newLat,
            lng: newLng,
            location: address?.city || address?.town || "Selected Area",
            address: display_name
          });
        }
        toast.success("Location found!");
      } else {
        toast.error("Location not found. Try being more specific.");
      }
    } catch (error) {
      toast.error("Search service unavailable.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
      
      {/* 🚀 FIX: Massive z-index (z-[9999]) to float ABOVE Leaflet, and centered beautifully */}
      {interactive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[450px] z-[9999]">
          <form 
            onSubmit={handleSearch}
            className="flex gap-2 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isSearching ? 'text-amber-500 animate-spin' : 'text-slate-500'}`} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Phoenix Mall, Pune)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-500 font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
            </button>
          </form>
        </div>
      )}

      {/* Map Container */}
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
      >
        <ChangeView center={mapCenter} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {!interactive && cinemas?.map((cinema) => (
          <Marker key={cinema.id} position={[cinema.lat, cinema.lng]} icon={customMarker}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <h4 className="font-bold text-base mb-1">{cinema.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{cinema.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {interactive && <MapClickHandler onLocationSelect={onLocationSelect} />}
        
        {interactive && onLocationSelect?.lat && (
           <Marker position={[onLocationSelect.lat, onLocationSelect.lng]} icon={customMarker} />
        )}
      </MapContainer>

      {/* Floating Tip at bottom */}
      {interactive && !searchQuery && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 pointer-events-none shadow-xl">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest text-center">👆 Search or click map to set pin</p>
        </div>
      )}
    </div>
  );
}