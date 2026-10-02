import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Minus, Plus, Trash2, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    serviceFee,
    totalAmount
  } = useCart();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            My Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Manage your picked dishes before booking
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today, Oct 24, 2024</span>
        </div>
      </div>

      {/* Main Cart Container */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-8 shadow-xs">
        {cartItems.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#14805f] flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed size={24} />
            </div>
            <h2 className="text-base font-bold text-[#111827]">Your cart is empty</h2>
            <p className="text-xs text-[#64748b] mt-1 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Browse Menu <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#111827]">
                Your Items ({itemCount})
              </h2>
              <button
                onClick={clearCart}
                type="button"
                className="text-xs font-semibold text-[#14805f] hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#111827] truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        {item.category} {item.quantity > 1 ? `(Qty ${item.quantity})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Total for Item */}
                    <span className="text-xs font-bold text-[#111827] w-14 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Trash Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      type="button"
                      className="text-[#f87171] hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations and Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827]">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Service Fee</span>
                <span className="font-semibold text-[#111827]">
                  ₹{serviceFee.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-[#111827]">Total</span>
                <span className="text-lg font-extrabold text-[#14805f]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/checkout')}
                  type="button"
                  className="w-full bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <div className="text-center mt-3">
                  <span className="text-xs text-gray-500">or </span>
                  <Link
                    to="/menu"
                    className="text-xs font-semibold text-[#14805f] hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
