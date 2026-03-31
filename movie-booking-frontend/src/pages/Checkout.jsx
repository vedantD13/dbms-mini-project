import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Ticket } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

import { useBooking } from '../context/BookingContext';
import SeatMatrix from '../components/SeatMatrix';
import TicketReceipt from '../components/TicketReceipt';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingData, updateBooking, clearBooking, globalBookedSeats, confirmBooking, cinemas } = useBooking();
  
  if (!bookingData || !bookingData.movie) {
    toast.error("Your cart is empty. Please select a movie first.");
    return <Navigate to="/" replace />;
  }

  // 1. Find the current cinema's blueprint
  const currentCinema = cinemas.find(c => c.name === bookingData.cinema) || cinemas[0];
  const cinemaLayout = currentCinema.seatLayout;

  const selectedSeats = bookingData.selectedSeats || [];
  const setSelectedSeats = (seats) => updateBooking({ selectedSeats: seats });
  
  const [paymentMethod, setPaymentMethod] = useState('stripe'); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // 2. Dynamic Pricing based on the cinema's blueprint
  const getSeatDetails = (seatId) => {
    const row = seatId.charAt(0);
    if (cinemaLayout.pricing.VIP.includes(row)) return { tier: 'VIP Recliner', price: 500, bg: 'bg-amber-500', shadow: 'rgba(245,158,11,0.6)' };
    if (cinemaLayout.pricing.Premium.includes(row)) return { tier: 'Premium', price: 250, bg: 'bg-indigo-500', shadow: 'rgba(99,102,241,0.6)' };
    return { tier: 'Standard', price: 150, bg: 'bg-slate-500', shadow: 'rgba(100,116,139,0.6)' };
  };

  const subtotal = selectedSeats.reduce((total, seatId) => total + getSeatDetails(seatId).price, 0);
  const convenienceFee = selectedSeats.length > 0 ? (selectedSeats.length * 30) : 0;
  const totalAmount = subtotal + convenienceFee;

  const handleSuccessfulPayment = (bookingId) => {
    confirmBooking(selectedSeats); // INSTANTLY LOCK SEATS GLOBALLY
    setReceiptData({
      id: bookingId,
      movie: bookingData.movie,
      format: bookingData.format || "IMAX 3D",
      cinema: bookingData.cinema,
      date: bookingData.date,
      time: bookingData.time,
      seats: selectedSeats.join(', '),
      amount: `₹${totalAmount}`
    });
    toast.success("Payment Successful! Your seats are locked.");
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    clearBooking();
    navigate('/dashboard');
  };

  const upiUrl = `upi://pay?pa=cinesync@okhdfcbank&pn=CineSync Cinemas&am=${totalAmount}&cu=INR`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-24 pb-12 px-6 relative font-sans selection:bg-amber-500/30">
      <Helmet><title>Checkout | CineSync</title></Helmet>
      
      <AnimatePresence>
        {showReceipt && receiptData && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 overflow-y-auto">
             <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3 }} className="my-auto py-10 w-full">
               <TicketReceipt booking={receiptData} onClose={handleCloseReceipt} />
               <div className="text-center mt-8">
                 <button onClick={handleCloseReceipt} className="text-slate-400 hover:text-amber-400 text-sm font-medium tracking-wide transition-colors">
                   ← Return to Dashboard
                 </button>
               </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-7xl flex flex-col xl:flex-row gap-8 lg:gap-16">
        
        {/* LEFT: Seat Matrix */}
        <div className="flex-1 bg-slate-900/50 rounded-3xl p-6 lg:p-10 border border-slate-800 shadow-2xl">
          <SeatMatrix 
            selectedSeats={selectedSeats} 
            setSelectedSeats={setSelectedSeats} 
            bookedSeats={globalBookedSeats} 
            getSeatDetails={getSeatDetails}
            layout={cinemaLayout} /* 🔥 Pass the blueprint down! */
          />
        </div>

        {/* RIGHT: Ticket Stub & Payment Gateway */}
        <div className="w-full xl:w-[440px] shrink-0">
          <div className="sticky top-24 space-y-6">
            
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <div className="p-8 pb-6 border-b-2 border-dashed border-slate-800 relative">
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-slate-950 rounded-full border-t border-r border-slate-800 rotate-45"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-950 rounded-full border-t border-l border-slate-800 -rotate-45"></div>
                <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                  <Ticket className="text-amber-500 shrink-0" /> 
                  <span className="truncate">{bookingData.movie || "Booking Summary"}</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium">{bookingData.cinema} • {bookingData.date} | {bookingData.time}</p>
              </div>

              <div className="p-8 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">Selected Seats ({selectedSeats.length})</span>
                  <span className="text-white text-right break-words max-w-[60%]">{selectedSeats.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">Tickets Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">Convenience Fee</span>
                  <span className="text-white">₹{convenienceFee}</span>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6"></div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-300 font-medium">Amount Payable</span>
                  <span className="text-4xl font-black text-amber-500">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-2 flex border border-slate-800 shadow-lg">
              <button onClick={() => setPaymentMethod('stripe')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 ${paymentMethod === 'stripe' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><CreditCard size={16} /> Credit Card</button>
              <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 ${paymentMethod === 'upi' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Smartphone size={16} /> UPI</button>
              <button onClick={() => setPaymentMethod('netbanking')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-2 ${paymentMethod === 'netbanking' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Building2 size={16} /> NetBanking</button>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl min-h-[250px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {paymentMethod === 'stripe' && (
                  <motion.div key="stripe" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm amount={totalAmount} selectedSeats={selectedSeats} disabled={selectedSeats.length === 0} onSuccess={handleSuccessfulPayment} />
                    </Elements>
                  </motion.div>
                )}
                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div className={`w-full aspect-square max-w-[160px] mx-auto bg-white rounded-2xl p-3 flex items-center justify-center shadow-lg border-4 border-slate-800 transition-opacity duration-300 ${selectedSeats.length === 0 ? 'opacity-30' : 'opacity-100'}`}>
                      {selectedSeats.length > 0 ? <img src={qrCodeApiUrl} alt="Dynamic UPI QR Code" className="w-full h-full object-contain mix-blend-multiply" /> : <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Select Seats<br/>to generate QR</div>}
                    </div>
                    <p className="text-center text-xs font-medium text-slate-400">{selectedSeats.length > 0 ? `Scan to pay exactly ₹${totalAmount}` : 'Please select seats first'}</p>
                    <button disabled={selectedSeats.length === 0} onClick={() => handleSuccessfulPayment('UPI_MOCK_123')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl font-bold text-lg cursor-not-allowed disabled:opacity-50 transition-colors duration-200">Verify & Pay (Mock)</button>
                  </motion.div>
                )}
                {paymentMethod === 'netbanking' && (
                  <motion.div key="netbanking" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Bank</label>
                      <select disabled={selectedSeats.length === 0} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all duration-200 text-slate-300 appearance-none font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        <option value="" disabled>Choose your bank...</option>
                        <option>HDFC Bank</option>
                        <option>State Bank of India</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                    <button disabled={selectedSeats.length === 0} onClick={() => handleSuccessfulPayment('NB_MOCK_456')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl font-bold text-lg cursor-not-allowed disabled:opacity-50 transition-colors duration-200">Proceed to Portal (Mock)</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}