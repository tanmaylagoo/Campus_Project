import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, CheckCircle2, ArrowRight, X, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Simple pleasant chime using browser Web Audio API
const playReadyChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // 2-tone melodic chime (E5 -> G#5)
    playTone(659.25, 0, 0.35);
    playTone(830.61, 0.2, 0.55);
  } catch (err) {
    // Audio context may be restricted before user gesture
    console.log('Audio chime not available:', err);
  }
};

const isVendorUser = () => {
  try {
    const s = sessionStorage.getItem('user');
    if (s && JSON.parse(s).role === 'admin') return true;
    const a = localStorage.getItem('admin_user');
    if (a) return true;
    const u = localStorage.getItem('user');
    if (u && JSON.parse(u).role === 'admin') return true;
  } catch {
    return false;
  }
  return false;
};

const ReadyAlertModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeReadyAlert, dismissReadyAlert } = useCart();

  // Strictly suppress alerts for vendors (both by route and by user role)
  const isVendorContext = location.pathname.startsWith('/admin') || isVendorUser();

  useEffect(() => {
    // Only sound chime for customers, never for vendor
    if (activeReadyAlert && !isVendorContext) {
      playReadyChime();
    }
  }, [activeReadyAlert, isVendorContext]);

  // Vendors should never see the ready pickup popup
  if (!activeReadyAlert || isVendorContext) return null;

  const handleView = () => {
    dismissReadyAlert(activeReadyAlert.id || activeReadyAlert.orderNumber);
    navigate('/orders');
  };

  const handleDismiss = () => {
    dismissReadyAlert(activeReadyAlert.id || activeReadyAlert.orderNumber);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center mx-auto mb-4 shadow-sm ring-8 ring-emerald-50">
          <Bell size={28} className="animate-bounce" />
        </div>

        <span className="inline-block text-[11px] font-bold text-[#059669] bg-[#ecfdf5] px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
          Meal Ready for Pickup
        </span>

        <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">
          Order #{activeReadyAlert.orderNumber || activeReadyAlert.id} is Ready!
        </h3>

        <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed px-2">
          Your meal has been prepared fresh by the kitchen and is waiting for you at the counter.
        </p>

        {activeReadyAlert.items && (
          <div className="my-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
              <Utensils size={14} className="text-[#14805f] shrink-0" />
              <span className="truncate">{activeReadyAlert.items}</span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1">
              📍 {activeReadyAlert.pickupLocation || 'Main Canteen'}
            </p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={handleView}
            type="button"
            className="w-full bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Active Order Ticket</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={handleDismiss}
            type="button"
            className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700 py-1.5 transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyAlertModal;
