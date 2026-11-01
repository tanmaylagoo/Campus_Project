import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  Utensils,
  X,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const Orders = () => {
  const navigate = useNavigate();
  const { currentOrders, orderHistory, reorder, fetchMyOrders, dismissReadyAlert } = useCart();
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Tick every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep trackingOrder synced with live currentOrders updates
  useEffect(() => {
    if (trackingOrder) {
      const updated = currentOrders.find(
        (o) => (o.orderNumber || o.id) === (trackingOrder.orderNumber || trackingOrder.id)
      );
      if (updated) {
        setTrackingOrder(updated);
      }
    }
  }, [currentOrders, trackingOrder]);

  const handleReorder = (order) => {
    reorder(order);
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'PLACED':
        return (
          <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Order Placed
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-[#f0f9ff] text-[#0284c7] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Accepted by Kitchen
          </span>
        );
      case 'PREPARING':
        return (
          <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
            Preparing
          </span>
        );
      case 'READY':
        return (
          <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs animate-pulse inline-flex items-center gap-1">
            <Bell size={12} />
            Ready for Pickup
          </span>
        );
      case 'COMPLETED':
      case 'DELIVERED':
        return (
          <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-50 text-red-500 text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
            {status}
          </span>
        );
    }
  };

  // Calculate live countdown for an order
  const getOrderCountdown = (order) => {
    const status = String(order.status).toUpperCase();
    if (status === 'READY') {
      return { text: 'Ready for Pickup!', isReady: true, percent: 100 };
    }
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      return { text: 'Done', isReady: false, percent: 100 };
    }

    const estTime = new Date(order.estimatedReadyTime).getTime();
    const created = new Date(order.createdAt).getTime();
    const totalDuration = Math.max(60, (estTime - created) / 1000);
    const remainingSec = Math.max(0, Math.floor((estTime - now) / 1000));
    const elapsedSec = Math.max(0, Math.floor((now - created) / 1000));

    if (remainingSec <= 0) {
      return { text: 'Ready for Pickup!', isReady: true, percent: 100 };
    }

    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    const percent = Math.min(95, Math.max(5, Math.round((elapsedSec / totalDuration) * 100)));

    return {
      text: `~${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`,
      isReady: false,
      percent,
    };
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Real-time meal preparation tracking and order history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMyOrders()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 shadow-xs cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
          >
            Browse Menu <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Active Ready Banner (if any active order is ready) */}
      {currentOrders.some((o) => String(o.status).toUpperCase() === 'READY') && (
        <div className="bg-[#ecfdf5] border-2 border-[#10b981] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#065f46]">
                Meal Ready for Pickup!
              </h3>
              <p className="text-xs text-[#047857] mt-0.5">
                Your order is hot and ready. Head to the counter to collect your food!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const readyOrd = currentOrders.find((o) => String(o.status).toUpperCase() === 'READY');
              if (readyOrd) setTrackingOrder(readyOrd);
            }}
            className="self-start sm:self-auto bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            View Pickup Counter
          </button>
        </div>
      )}

      {/* Current Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#111827]">Current Active Orders</h2>
            <span className="bg-[#ecfdf5] text-[#10b981] text-[11px] font-bold px-2 py-0.5 rounded-full">
              {currentOrders.length} Active
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Live Kitchen Updates</span>
        </div>

        {currentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={20} />
            </div>
            <p className="text-xs font-medium text-gray-500">No active orders right now.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Pick your favorite meal from our menu to track prep time in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Prep Countdown</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentOrders.map((order) => {
                  const countdown = getOrderCountdown(order);
                  return (
                    <tr key={order.orderNumber || order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 font-bold text-[#111827]">
                        #{order.orderNumber || order.id}
                      </td>
                      <td className="py-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <Utensils size={13} />
                          </div>
                          <span className="font-medium text-[#111827] truncate">
                            {order.items}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Clock size={13} className={countdown.isReady ? 'text-[#059669]' : 'text-[#ea580c]'} />
                            <span className={countdown.isReady ? 'text-[#059669] font-bold' : 'text-[#ea580c]'}>
                              {countdown.text}
                            </span>
                          </div>
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                countdown.isReady ? 'bg-[#059669]' : 'bg-[#ea580c]'
                              }`}
                              style={{ width: `${countdown.percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-[#111827] block">
                          ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                        </span>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            order.paymentMethod !== 'Pay at Counter'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.paymentMethod !== 'Pay at Counter'
                            ? 'Online • Paid'
                            : 'Pay at Counter'}
                        </span>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setTrackingOrder(order)}
                          type="button"
                          className="bg-[#14805f] hover:bg-[#106d50] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Live Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
        <h2 className="text-sm font-bold text-[#111827] mb-6">
          Order History ({orderHistory.length})
        </h2>

        {orderHistory.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No completed orders in history yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {orderHistory.map((order) => (
                  <tr key={order.orderNumber || order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 font-bold text-[#111827]">
                      #{order.orderNumber || order.id}
                    </td>
                    <td className="py-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <Utensils size={13} />
                        </div>
                        <span className="font-medium text-[#111827] truncate">
                          {order.items}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-[#64748b]">
                      {order.date || new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-bold text-[#111827]">
                      ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleReorder(order)}
                        type="button"
                        className="border border-gray-200/90 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Order Tracking Modal */}
      {trackingOrder && (() => {
        const countdown = getOrderCountdown(trackingOrder);
        const st = String(trackingOrder.status).toUpperCase();
        const isPlaced = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].includes(st);
        const isPrep = ['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].includes(st);
        const isReady = ['READY', 'COMPLETED'].includes(st);

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100">
              <button
                onClick={() => setTrackingOrder(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isReady ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fff7ed] text-[#ea580c]'
                }`}>
                  <Clock size={22} className={isReady ? '' : 'animate-spin-slow'} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">
                    Order #{trackingOrder.orderNumber || trackingOrder.id}
                  </h3>
                  <p className="text-xs text-gray-500">Live Kitchen Prep Countdown</p>
                </div>
              </div>

              {/* Ready Alert highlight if order is ready */}
              {isReady && (
                <div className="mb-5 p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl flex items-center gap-3 text-xs text-[#065f46]">
                  <CheckCircle2 size={18} className="text-[#059669] shrink-0" />
                  <div>
                    <p className="font-bold">Meal is Ready for Pickup!</p>
                    <p className="text-[11px] text-[#047857]">Please present your order ticket at the counter.</p>
                  </div>
                </div>
              )}

              {/* Dynamic countdown card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 mb-6 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Estimated Status</span>
                  <span className={`text-xs font-bold ${isReady ? 'text-[#059669]' : 'text-[#ea580c]'}`}>
                    {countdown.text}
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${isReady ? 'bg-[#059669]' : 'bg-[#14805f]'}`}
                    style={{ width: `${countdown.percent}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-gray-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items:</span>
                    <span className="font-semibold text-gray-800 text-right max-w-xs truncate">
                      {trackingOrder.items}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pickup Counter:</span>
                    <span className="font-semibold text-gray-800">
                      {trackingOrder.pickupLocation || 'Main Canteen'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prep Window:</span>
                    <span className="font-semibold text-gray-800">
                      ~{trackingOrder.avgPrepTimeMinutes || 5} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Stepper with live states */}
              <div className="space-y-4 px-1">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#14805f] text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Order Placed & Confirmed</p>
                    <p className="text-[10px] text-gray-400">Kitchen received your ticket</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isPrep ? 'bg-[#14805f] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPrep ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isPrep ? 'text-gray-800' : 'text-gray-400'}`}>
                      In Kitchen Preparation
                    </p>
                    <p className="text-[10px] text-gray-400">Chefs are preparing fresh food</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isReady ? 'bg-[#059669] text-white ring-4 ring-emerald-100' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isReady ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isReady ? 'text-[#059669]' : 'text-gray-400'}`}>
                      Ready for Pickup
                    </p>
                    <p className="text-[10px] text-gray-400">Collect at designated counter</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTrackingOrder(null)}
                type="button"
                className="w-full mt-6 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Close Tracking
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Orders;
