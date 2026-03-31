import { Armchair } from 'lucide-react';

export default function SeatMatrix({ selectedSeats, setSelectedSeats, bookedSeats, getSeatDetails }) {
  const tiers = [
    { name: "VIP Recliners (₹500)", rows: ['A', 'B'], color: "hover:border-amber-500 hover:text-amber-500" },
    { name: "Premium (₹250)", rows: ['C', 'D', 'E'], color: "hover:border-indigo-500 hover:text-indigo-500" },
    { name: "Standard (₹150)", rows: ['F', 'G'], color: "hover:border-slate-400 hover:text-slate-400" }
  ];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < 6) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert("You can only book up to 6 seats at a time.");
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-2xl font-bold mb-8 text-white">Select Your Seats</h2>
      
      {/* Screen Curve Graphic */}
      <div className="relative w-full h-12 mb-16 flex justify-center mt-4">
        <div className="absolute top-0 w-4/5 h-full border-t-4 border-white/80 rounded-t-[100%] opacity-40 shadow-[0_-20px_60px_rgba(255,255,255,0.3)]"></div>
        <span className="absolute top-8 text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">Screen This Way</span>
      </div>

      <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
        <div className="min-w-max flex flex-col items-center mx-auto space-y-8">
          {tiers.map((tier, tIdx) => (
            <div key={tIdx} className="w-full flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-4 font-bold bg-slate-950 px-4 py-1 rounded-full border border-slate-800">
                {tier.name}
              </span>
              <div className="flex flex-col gap-4">
                {tier.rows.map((row) => (
                  <div key={row} className="flex gap-4 items-center">
                    <span className="text-slate-500 font-bold w-6 text-right">{row}</span>
                    <div className="flex gap-2 sm:gap-3">
                      {cols.map((col) => {
                        const seatId = `${row}${col}`;
                        const isBooked = bookedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        const seatDetails = getSeatDetails(seatId);

                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked}
                            // Clean, snappy Tailwind transitions instead of bouncy springs
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-t-xl rounded-b-md flex items-center justify-center border transition-all duration-200 ease-out 
                              ${isBooked ? 'bg-slate-950/50 text-slate-800 border-slate-800/50 cursor-not-allowed' : 
                                isSelected ? `${seatDetails.bg} text-white shadow-lg border-transparent scale-105` : 
                                `bg-slate-800/50 text-transparent border-slate-700 ${tier.color} hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98]`}`}
                          >
                            <Armchair size={18} className={isBooked ? 'opacity-10' : ''} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pricing Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs font-bold uppercase tracking-wider text-slate-400 border-t border-slate-800 pt-8">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded-sm"></div> VIP (₹500)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-500 rounded-sm"></div> Premium (₹250)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-500 rounded-sm"></div> Standard (₹150)</div>
      </div>
    </div>
  );
}