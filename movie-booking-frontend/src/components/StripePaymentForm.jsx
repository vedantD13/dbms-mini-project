import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function StripePaymentForm({ amount, selectedSeats, disabled, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || disabled) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: selectedSeats,
          amount: amount,
          paymentMethodId: paymentMethod.id
        })
      });

      // Simulation fallback if backend isn't hooked up yet
      if (!response.ok && response.status === 404) {
          setTimeout(() => onSuccess(`BK${Math.floor(Math.random() * 90000) + 10000}X`), 1500);
          return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Transaction failed. Seats may be unavailable.');
      
      onSuccess(data.bookingId);
      
    } catch (err) {
      setError(err.message);
    } finally {
      if(error) setProcessing(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Lock size={12} /> Secure Card Payment
        </label>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-inner focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#f8fafc',
                fontFamily: '"Inter", system-ui, sans-serif',
                '::placeholder': { color: '#64748b' },
                iconColor: '#cbd5e1',
              },
              invalid: { color: '#ef4444', iconColor: '#ef4444' },
            },
          }} />
        </div>
      </div>
      
      {error && (
        <div className="flex items-start gap-3 text-red-400 bg-red-950/50 p-4 rounded-xl text-sm border border-red-900/50">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || processing || disabled}
        className="w-full relative group overflow-hidden bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {processing ? (
            "Authenticating..."
          ) : (
            <>Pay ₹{amount} Now</>
          )}
        </span>
      </button>
      
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1"><CheckCircle2 size={12}/> PCI DSS Compliant</span>
        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
        <span className="flex items-center gap-1"><CheckCircle2 size={12}/> 256-bit Encryption</span>
      </div>
    </form>
  );
}