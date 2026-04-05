import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Ticket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

import { useBooking } from '../context/BookingContext';
import SeatMatrix from '../components/SeatMatrix';
import TicketReceipt from '../components/TicketReceipt';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    bookingData, updateBooking, clearBooking,
    globalBookedSeats, confirmBooking,
    createBooking, fetchBookedSeats,
    currentUser, cinemas
  } = useBooking();

  const [liveBookedSeats, setLiveBookedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardError, setCardError] = useState('');

  // Guard: redirect in useEffect — NEVER call toast/navigate during render
  useEffect(() => {
    if (!bookingData?.movie) {
      toast.error('Your cart is empty. Please select a movie first.');
      navigate('/dashboard', { replace: true });
    }
  }, []);

  // Load live booked seats from DB — use showDate (YYYY-MM-DD) not date (display string)
  useEffect(() => {
    if (bookingData?.cinemaId && bookingData?.showDate && bookingData?.time) {
      fetchBookedSeats(bookingData.cinemaId, bookingData.showDate, bookingData.time).then(seats => {
        setLiveBookedSeats(seats || []);
      }).catch(() => {});
    }
  }, []);

  // Show spinner while booking data not yet loaded
  if (!bookingData?.movie) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Redirecting...</div>
      </div>
    );
  }

  // Find the current cinema's seat layout
  const currentCinema = cinemas.find(c => c.id === bookingData.cinemaId)
    || cinemas.find(c => c.name === bookingData.cinema)
    || cinemas[0];
  const cinemaLayout = currentCinema?.seatLayout;

  const selectedSeats = bookingData.selectedSeats || [];
  const setSelectedSeats = (seats) => updateBooking({ selectedSeats: seats });

  // Merge DB booked seats + in-memory globally confirmed seats
  const allBookedSeats = [...new Set([...liveBookedSeats, ...globalBookedSeats])];

  // Dynamic Pricing based on cinema layout
  const getSeatDetails = (seatId) => {
    const row = seatId.charAt(0);
    if (cinemaLayout?.pricing?.VIP?.includes(row)) return { tier: 'VIP Recliner', price: 500, bg: 'bg-amber-500' };
    if (cinemaLayout?.pricing?.Premium?.includes(row)) return { tier: 'Premium', price: 250, bg: 'bg-indigo-500' };
    return { tier: 'Standard', price: 150, bg: 'bg-slate-500' };
  };

  const subtotal = selectedSeats.reduce((total, seatId) => total + getSeatDetails(seatId).price, 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 30 : 0;
  const totalAmount = subtotal + convenienceFee;

  // Called after any payment method succeeds
  const handleSuccessfulPayment = async (bookingId) => {
    setProcessing(true);

    // showDate is YYYY-MM-DD (e.g. '2026-04-05'), date is display string (e.g. 'Saturday, 05 April 2026')
    const showDate = bookingData.showDate || new Date().toISOString().split('T')[0];

    try {
      const payload = {
        id: bookingId,
        user_id: currentUser?.id,
        movie_id: bookingData.movieId,
        cinema_id: bookingData.cinemaId,
        show_date: showDate,
        show_time: bookingData.time,
        seats_booked: selectedSeats,
        total_amount: totalAmount
      };
      await createBooking(payload);
      confirmBooking(selectedSeats);
    } catch (err) {
      if (err.message && err.message.includes('already booked')) {
        toast.error(err.message);
        setProcessing(false);
        return;
      }
      console.warn('DB save failed (demo mode):', err.message);
      toast('⚠️ Running in offline demo mode — booking not saved to database.', {
        icon: '⚠️',
        style: { background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }
      });
      confirmBooking(selectedSeats);
    }

    setReceiptData({
      id: bookingId,
      movie: bookingData.movie,
      format: bookingData.format || 'IMAX',
      cinema: bookingData.cinema,
      screen: bookingData.screen || 'Screen 2',
      poster: bookingData.poster,
      date: showDate,
      time: bookingData.time,
      seats: selectedSeats.join(', '),
      amount: `₹${totalAmount}`
    });

    toast.success('🎉 Booking Confirmed! Your seats are locked.');
    setShowReceipt(true);
    setProcessing(false);
  };

  const handleCloseReceipt = () => {
    clearBooking();
    navigate('/dashboard');
  };

  // Card payment validation
  const validateCard = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) return 'Enter a valid 16-digit card number.';
    if (!cardData.name.trim()) return 'Enter the cardholder name.';
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) return 'Enter expiry in MM/YY format.';
    if (!cardData.cvv || cardData.cvv.length < 3) return 'Enter a valid CVV.';
    return null;
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const err = validateCard();
    if (err) { setCardError(err); return; }
    setCardError('');
    const bookingId = `BK${Math.floor(Math.random() * 90000) + 10000}X`;
    handleSuccessfulPayment(bookingId);
  };

  const handleUpiPay = () => {
    if (selectedSeats.length === 0) { toast.error('Please select seats first.'); return; }
    const bookingId = `BK${Math.floor(Math.random() * 90000) + 10000}X`;
    handleSuccessfulPayment(bookingId);
  };

  const handleNetBankingPay = () => {
    if (selectedSeats.length === 0) { toast.error('Please select seats first.'); return; }
    const bookingId = `BK${Math.floor(Math.random() * 90000) + 10000}X`;
    handleSuccessfulPayment(bookingId);
  };

  const formatCardNumber = (val) => val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').substring(0, 4);
    return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2) : v;
  };

  const upiUrl = `upi://pay?pa=kashvigautam936@oksbi&pn=CineSync Cinemas&am=${totalAmount}&cu=INR`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-12 px-4 md:px-6 relative font-sans">
      <Helmet><title>Checkout | CineSync</title></Helmet>

      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center px-6 py-4 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors font-bold text-sm">
          <ArrowLeft size={16}/> Back
        </button>
        <span className="text-sm font-bold text-white">Checkout — {bookingData.movie}</span>
      </nav>

      {/* RECEIPT MODAL */}
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

      <div className="container mx-auto max-w-7xl flex flex-col xl:flex-row gap-8 lg:gap-16 pt-24">

        {/* LEFT: Seat Matrix */}
        <div className="flex-1 bg-slate-900/50 rounded-3xl p-6 lg:p-10 border border-slate-800 shadow-2xl">
          {cinemaLayout ? (
            <SeatMatrix
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              bookedSeats={allBookedSeats}
              getSeatDetails={getSeatDetails}
              layout={cinemaLayout}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">Loading seat map...</div>
          )}
        </div>

        {/* RIGHT: Ticket Summary & Payment */}
        <div className="w-full xl:w-[440px] shrink-0">
          <div className="sticky top-24 space-y-6">

            {/* Ticket Stub */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <div className="p-8 pb-6 border-b-2 border-dashed border-slate-800 relative">
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-slate-950 rounded-full border-t border-r border-slate-800 rotate-45"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-950 rounded-full border-t border-l border-slate-800 -rotate-45"></div>
                <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                  <Ticket className="text-amber-500 shrink-0" />
                  <span className="truncate">{bookingData.movie}</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black">Amount Payable</span>
                  <span className="text-3xl font-black text-amber-500">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              <div className="flex border-b border-slate-800">
                {[
                  { id: 'card', label: 'Card', icon: <CreditCard size={14}/> },
                  { id: 'upi', label: 'UPI', icon: <Smartphone size={14}/> },
                  { id: 'netbanking', label: 'NetBanking', icon: <Building2 size={14}/> },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${paymentMethod === m.id ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">

                  {/* CARD PAYMENT */}
                  {paymentMethod === 'card' && (
                    <motion.form key="card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4" onSubmit={handleCardSubmit}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={12}/> Card Details <span className="text-emerald-500 text-[10px]">(Demo)</span>
                      </label>
                      <input
                        type="text" placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none font-mono tracking-widest"
                        maxLength={19}
                      />
                      <input
                        type="text" placeholder="Cardholder Name"
                        value={cardData.name}
                        onChange={e => setCardData({...cardData, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text" placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={e => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none font-mono"
                          maxLength={5}
                        />
                        <input
                          type="text" placeholder="CVV"
                          value={cardData.cvv}
                          onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none font-mono"
                        />
                      </div>
                      {cardError && <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/30 rounded-xl p-3">{cardError}</p>}
                      <button
                        type="submit"
                        disabled={selectedSeats.length === 0 || processing}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      >
                        {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
                      </button>
                      <p className="text-center text-[10px] text-slate-600">🔒 PCI DSS Compliant · 256-bit Encryption · Demo Mode</p>
                    </motion.form>
                  )}

                  {/* UPI PAYMENT */}
                  {paymentMethod === 'upi' && (
                    <motion.div key="upi" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={12}/> UPI QR Payment <span className="text-emerald-500 text-[10px]">(Demo)</span>
                      </label>
                      <div className={`w-full aspect-square max-w-[160px] mx-auto bg-white rounded-2xl p-3 flex items-center justify-center border-4 border-slate-800 transition-opacity ${selectedSeats.length === 0 ? 'opacity-30' : 'opacity-100'}`}>
                        {selectedSeats.length > 0
                          ? <img src={qrCodeApiUrl} alt="UPI QR" className="w-full h-full object-contain mix-blend-multiply" />
                          : <div className="text-center text-slate-400 text-xs font-bold">Select Seats<br/>First</div>
                        }
                      </div>
                      <p className="text-center text-xs text-slate-400">
                        {selectedSeats.length > 0 ? `Scan to pay ₹${totalAmount} to kashvigautam936@oksbi` : 'Select seats to generate QR'}
                      </p>
                      <button
                        disabled={selectedSeats.length === 0 || processing}
                        onClick={handleUpiPay}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-base transition-all"
                      >
                        {processing ? 'Verifying...' : `I've Paid ₹${totalAmount} via UPI`}
                      </button>
                      <p className="text-center text-[10px] text-slate-600">After scanning and paying, click the button above to confirm.</p>
                    </motion.div>
                  )}

                  {/* NET BANKING */}
                  {paymentMethod === 'netbanking' && (
                    <motion.div key="netbanking" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12}/> Net Banking <span className="text-emerald-500 text-[10px]">(Demo)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'].map(bank => (
                          <button key={bank} onClick={handleNetBankingPay} disabled={selectedSeats.length === 0 || processing}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 hover:border-amber-500/30 rounded-xl p-4 text-sm font-bold text-white transition-all text-left">
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                      {selectedSeats.length === 0 && <p className="text-center text-slate-500 text-xs">Select seats to enable payment</p>}
                      <p className="text-center text-[10px] text-slate-600">This is a demo — no real transaction occurs.</p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}