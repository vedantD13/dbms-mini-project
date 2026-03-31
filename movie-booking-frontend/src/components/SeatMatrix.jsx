import { motion } from 'framer-motion';

export default function SeatMatrix({ selectedSeats, setSelectedSeats, bookedSeats, getSeatDetails, layout }) {
  
  // Dynamic layout extraction with fallbacks
  const rows = layout?.rows || ['A', 'B', 'C', 'D', 'E'];
  const totalCols = layout?.cols || 10;
  const aislePosition = layout?.aisleAfter || 5;

  const cols = Array.from({ length: totalCols }, (_, i) => i + 1);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return; 
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert("You can only select up to 6 seats per transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* 1. The Glowing Screen */}
      <div className="w-full max-w-2xl mb-12 relative flex flex-col items-center">
        <div className="w-full h-2 bg-amber-500/50 rounded-full blur-[2px]"></div>
        <div className="w-full h-12 bg-gradient-to-b from-amber-500/20 to-transparent -mt-1 blur-xl"></div>
        <div className="absolute top-4 text-amber-500/50 text-xs font-bold tracking-[0.3em] uppercase">Cinema Screen</div>
      </div>

      {/* 2. DYNAMIC Seat Grid */}
      <div className="flex flex-col gap-4 mb-10 overflow-x-auto w-full max-w-3xl pb-4 custom-scrollbar">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-center gap-2 sm:gap-4 min-w-max mx-auto">
            <div className="w-6 text-center font-bold text-slate-500 text-sm">{row}</div>
            
            <div className="flex gap-2">
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const isBooked = bookedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isAisle = col === aislePosition;
                const details = getSeatDetails(seatId);

                return (
                  <div key={seatId} className={`flex items-center ${isAisle ? 'mr-6 sm:mr-10' : ''}`}>
                    <button
                      disabled={isBooked}
                      onClick={() => toggleSeat(seatId)}
                      title={`${details.tier} - ₹${details.price}`}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-t-xl rounded-b-md transition-all duration-300 relative group overflow-hidden
                        ${isBooked ? 'bg-slate-800 opacity-50 cursor-not-allowed shadow-none' : isSelected ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110 -translate-y-1' : `${details.bg} hover:-translate-y-1 hover:brightness-125`}
                      `}
                    >
                      <div className={`absolute bottom-0 w-full h-1/3 bg-black/20 rounded-b-md`}></div>
                      {!isBooked && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {col}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="w-6 text-center font-bold text-slate-500 text-sm">{row}</div>
          </div>
        ))}
      </div>

      {/* 3. The Interactive Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-3xl">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center border-b border-slate-800 pb-3">Seat Legend</h4>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-slate-800 opacity-50"></div>
            <span className="text-sm font-medium text-slate-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            <span className="text-sm font-bold text-white">Selected</span>
          </div>
          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-amber-500"></div>
            <span className="text-sm font-medium text-slate-300">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-indigo-500"></div>
            <span className="text-sm font-medium text-slate-300">Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-slate-500"></div>
            <span className="text-sm font-medium text-slate-300">Standard</span>
          </div>
        </div>
      </div>

    </div>
  );
}