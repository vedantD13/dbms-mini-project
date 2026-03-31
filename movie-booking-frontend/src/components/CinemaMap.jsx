import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import toast from 'react-hot-toast';
import { useBooking } from '../context/BookingContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🚀 FIX: Bypass Vite's broken image imports by using a direct CDN URL for a custom Gold/Amber marker
const customMarker = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Sub-component to handle map clicks for the Admin
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      if (!onLocationSelect) return;
      const { lat, lng } = e.latlng;
      
      try {
        toast.loading("Fetching address...", { id: 'geo' });
        // Free OpenStreetMap Geocoding API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        onLocationSelect({
          lat,
          lng,
          location: data.address.city || data.address.town || data.address.state_district || 'Unknown City',
          address: data.display_name
        });
        toast.success("Location acquired!", { id: 'geo' });
      } catch (err) {
        toast.error("Failed to fetch address details.", { id: 'geo' });
      }
    }
  });
  return null;
}

export default function CinemaMap({ interactive = false, onLocationSelect, center = [19.0760, 72.8777] }) {
  const { cinemas } = useBooking();

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
      >
        {/* 🚀 FIX: Switched to the colorful, standard OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Render existing cinemas as markers */}
        {!interactive && cinemas && cinemas.map((cinema) => (
          <Marker key={cinema.id} position={[cinema.lat, cinema.lng]} icon={customMarker}>
            <Popup className="custom-popup">
              <div className="text-slate-900 font-sans p-1">
                <h4 className="font-bold text-lg mb-1">{cinema.name}</h4>
                <p className="text-xs text-slate-600 mb-2">{cinema.address}</p>
                <span className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">{cinema.premium}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Enable clicking to get coordinates for Admin */}
        {interactive && <MapClickHandler onLocationSelect={onLocationSelect} />}
        
        {/* Show a temporary marker where the admin clicked */}
        {interactive && onLocationSelect?.lat && (
           <Marker position={[onLocationSelect.lat, onLocationSelect.lng]} icon={customMarker} />
        )}
      </MapContainer>

      {/* Admin Instruction Overlay */}
      {interactive && (
        <div className="absolute top-4 right-4 z-[400] bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700 pointer-events-none shadow-xl">
          <p className="text-sm font-bold text-amber-500 flex items-center gap-2">👆 Click anywhere to set location</p>
        </div>
      )}
    </div>
  );
}