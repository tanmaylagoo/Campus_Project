import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    serviceFee,
    totalAmount,
    placeOrder,
    onOrderCompleted,
  } = useCart();

  const [pickupLocation, setPickupLocation] = useState('Main Canteen');
  const [paymentMethod, setPaymentMethod] = useState('Online Payment');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [pendingOrderNumber, setPendingOrderNumber] = useState(null);

  // Calculate highest prep time among items in the cart according to menu item prep time
  const estimatedPrepMinutes =
    cartItems.length > 0
      ? Math.max(
          ...cartItems.map((item) =>
            item.avgPrepTimeMinutes != null ? Number(item.avgPrepTimeMinutes) : 5
          )
        )
      : 5;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsPlacing(true);
    setError('');
    setStatusNotice('');

    // =========================================================================
    // PATH 1: Pay at Counter — 100% UNTOUCHED ORIGINAL FUNCTIONALITY
    // =========================================================================
    if (paymentMethod === 'Pay at Counter') {
      try {
        await placeOrder({
          location: pickupLocation,
          paymentMethod: 'Pay at Counter',
        });
        navigate('/orders');
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err.message || 'Failed to place order. Please try again.');
      } finally {
        setIsPlacing(false);
      }
      return;
    }

    // =========================================================================
    // PATH 2: Online Payment — RAZORPAY PAYMENT GATEWAY (TEST MODE)
    // =========================================================================
    try {
      // Ensure Razorpay SDK script is loaded
      if (typeof window.Razorpay === 'undefined') {
        const scriptLoaded = await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }
      }

      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const customer = (() => {
        try {
          const saved = localStorage.getItem('user');
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })();

      // 1. Create Razorpay order on backend (amount calculated securely on server)
      const createRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            avgPrepTimeMinutes:
              item.avgPrepTimeMinutes != null ? Number(item.avgPrepTimeMinutes) : 5,
            image_url: item.image_url || item.imageUrl || '',
          })),
          pickupLocation,
          customerName: customer?.username || customer?.name || 'Student Eater',
          customerEmail: customer?.email || '',
          existingOrderNumber: pendingOrderNumber,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initiate payment on server');
      }

      setPendingOrderNumber(orderData.orderNumber);

      // 2. Open official Razorpay Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'College Canteen',
        description: `Order #${orderData.orderNumber} (Online Payment Test Mode)`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name:
            orderData.customer?.name ||
            customer?.username ||
            customer?.name ||
            'Campus Student',
          email: orderData.customer?.email || customer?.email || 'student@campus.edu',
          contact: '9999999999',
        },
        notes: {
          orderNumber: orderData.orderNumber,
        },
        theme: {
          color: '#14805f',
        },
        handler: async function (response) {
          try {
            setIsPlacing(true);
            setStatusNotice('Payment received! Verifying securely with canteen server...');

            // 3. Verify Razorpay Payment Signature on backend
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderNumber: orderData.orderNumber,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }

            setStatusNotice('Payment verified! Kitchen has accepted your ticket.');
            if (onOrderCompleted) {
              onOrderCompleted(verifyData.order);
            }
            setTimeout(() => {
              navigate('/orders');
            }, 800);
          } catch (verifyErr) {
            console.error('Online payment verification error:', verifyErr);
            setError(verifyErr.message || 'Payment verification failed. Please try again.');
            setIsPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPlacing(false);
            setError('Payment cancelled or checkout window closed. You can retry when ready.');
            fetch(`${API_URL}/payment/cancel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.razorpayOrderId,
                orderNumber: orderData.orderNumber,
              }),
            }).catch(() => {});
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setError(
          `Online payment failed: ${
            failResponse.error?.description || 'Payment rejected'
          }. You can retry.`
        );
        setIsPlacing(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      setError(err.message || 'Failed to initiate online payment. Please try again.');
      setIsPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Review your order details and choose your preferred payment option
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today's Order</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {statusNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-[#059669] font-semibold animate-pulse">
          <Sparkles size={16} className="shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Order Summary Column */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">
            Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              Your cart is empty.{' '}
              <Link to="/menu" className="text-[#14805f] font-semibold hover:underline">
                Add dishes from the menu
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3 pb-5 border-b border-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-3">
                      <span className="font-bold text-[#14805f] shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-[#111827] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-[#111827] shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotals */}
              <div className="space-y-2.5 pt-1 text-xs text-[#64748b]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111827]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kitchen Service Fee</span>
                  <span className="font-semibold text-[#111827]">
                    ₹{serviceFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-[#111827]">Total Amount</span>
                <span className="text-xl font-extrabold text-[#14805f]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pickup Details Column */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">
            Pickup & Meal Prep Details
          </h2>

          <div className="space-y-5">
            {/* Pickup Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Pickup Location
              </label>
              <div className="relative flex items-center justify-between h-11 px-3.5 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-medium text-gray-800 shadow-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#14805f]" />
                  <span className="font-bold text-[#111827]">Main Canteen</span>
                </div>
                <span className="text-[10px] font-semibold bg-[#e8f5f0] text-[#14805f] px-2 py-0.5 rounded-md border border-[#bce4d4]">
                  Counter Pickup
                </span>
              </div>
            </div>

            {/* Estimated Meal Prep Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Estimated Meal Prep Time
              </label>
              <div className="bg-[#e8f5f0]/70 border border-[#bce4d4] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#14805f]">
                <div className="flex items-center gap-2.5 font-semibold">
                  <Clock size={16} />
                  <span>~{estimatedPrepMinutes} minutes prep time</span>
                </div>
                <span className="text-[11px] font-bold bg-white text-[#059669] px-2 py-0.5 rounded-md border border-[#bce4d4]">
                  Live Tracking
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] mt-1.5">
                We'll track the prep time in real-time and alert you as soon as your meal is ready!
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-800">
                  Payment Method
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {paymentMethod === 'Online Payment' ? 'Razorpay (Test Mode)' : 'Pay at Counter'}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'Pay at Counter',
                    label: 'Pay at Counter',
                    sub: 'Pay with cash, card, or QR code when picking up meal at the counter',
                    badge: null,
                  },
                  {
                    id: 'Online Payment',
                    label: 'Online Payment',
                    sub: 'Pay instantly via Cards, Netbanking, or Wallets (Razorpay Test Mode)',
                    badge: 'Instant Confirmation',
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-[#14805f] bg-[#f0f9f6]/40 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-[#14805f] cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#111827]">{pm.label}</p>
                          {pm.badge && (
                            <span className="text-[9px] font-semibold bg-[#14805f]/10 text-[#14805f] px-1.5 py-0.2 rounded">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748b]">{pm.sub}</p>
                      </div>
                    </div>
                    {paymentMethod === pm.id && (
                      <CheckCircle size={16} className="text-[#14805f] shrink-0" />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <ShieldCheck size={14} className="text-[#14805f]" />
                <span>
                  {paymentMethod === 'Online Payment'
                    ? 'Online payment is running in TEST MODE via Razorpay. No real money will be charged.'
                    : 'Counter payment will be confirmed upon meal pickup.'}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || isPlacing}
                type="button"
                className="w-full bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3.5 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isPlacing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>
                      {paymentMethod === 'Online Payment'
                        ? 'Opening Razorpay Payment...'
                        : 'Confirming Order & Ticket...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'Online Payment'
                      ? `Pay ₹${totalAmount.toFixed(2)} Online`
                      : `Confirm Order & Pay ₹${totalAmount.toFixed(2)} at Counter`}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/cart')}
                type="button"
                className="w-full text-xs font-semibold text-[#64748b] hover:text-gray-900 transition-colors mt-3 text-center block cursor-pointer"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
