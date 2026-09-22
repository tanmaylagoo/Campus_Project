import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, ChevronDown, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, serviceFee, totalAmount, placeOrder } = useCart();
  const [pickupLocation, setPickupLocation] = useState('Main Canteen - Building A');
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setTimeout(() => {
      placeOrder({ location: pickupLocation });
      setIsPlacing(false);
      navigate('/orders');
    }, 600);
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
            Review details and place your canteen order
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today, Oct 24, 2024</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Order Summary Column */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">
            Order Summary
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
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotals */}
              <div className="space-y-2.5 pt-1 text-xs text-[#64748b]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111827]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Fee</span>
                  <span className="font-semibold text-[#111827]">
                    ${serviceFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-[#111827]">Total Amount</span>
                <span className="text-xl font-extrabold text-[#14805f]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pickup Details Column */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">
            Pickup Details
          </h2>

          <div className="space-y-5">
            {/* Pickup Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-medium text-gray-800 outline-none appearance-none focus:border-[#14805f] focus:ring-2 focus:ring-[#14805f]/15 cursor-pointer shadow-xs"
                >
                  <option value="Main Canteen - Building A">Main Canteen - Building A</option>
                  <option value="North Campus Food Hall - Level 1">North Campus Food Hall - Level 1</option>
                  <option value="Engineering Block Bistro">Engineering Block Bistro</option>
                  <option value="Student Union Deli - Ground Floor">Student Union Deli - Ground Floor</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Estimated Pickup Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Estimated Pickup Time
              </label>
              <div className="bg-[#e8f5f0]/70 border border-[#bce4d4] rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-semibold text-[#14805f]">
                <Clock size={16} />
                <span>15-20 minutes</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-2">
                Payment Method
              </label>
              <div className="border-2 border-[#14805f] bg-[#f0f9f6]/30 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-[#14805f] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#14805f]" />
                  </div>
                  <div className="text-[#14805f]">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">Campus Card</p>
                    <p className="text-[11px] text-[#64748b]">Balance: $45.10</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#14805f] bg-white px-2 py-0.5 rounded border border-[#bce4d4]">
                  Default
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || isPlacing}
                type="button"
                className="w-full bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3.5 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPlacing ? 'Processing Order...' : 'Place Order'}
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
