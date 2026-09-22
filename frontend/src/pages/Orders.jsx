import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Utensils, X, Clock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Orders = () => {
  const navigate = useNavigate();
  const { currentOrders, orderHistory, reorder } = useCart();
  const [trackingOrder, setTrackingOrder] = useState(null);

  const handleReorder = (order) => {
    reorder(order);
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Preparing':
        return (
          <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Preparing
          </span>
        );
      case 'Ready for Pickup':
        return (
          <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Ready for Pickup
          </span>
        );
      case 'Delivered':
        return (
          <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold px-2.5 py-1 rounded-md">
            Delivered
          </span>
        );
      case 'Cancelled':
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

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Keep track of your current meals and past orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
            <Calendar size={14} className="text-gray-400" />
            <span>Today, Oct 24, 2024</span>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
          >
            Browse Menu <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Current Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <h2 className="text-sm font-bold text-[#111827]">Current Orders</h2>
          <span className="bg-[#ecfdf5] text-[#10b981] text-[11px] font-bold px-2 py-0.5 rounded-full">
            {currentOrders.length} Active
          </span>
        </div>

        {currentOrders.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No active orders right now.
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
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 font-bold text-[#111827]">
                      #{order.id}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <Utensils size={13} />
                        </div>
                        <span className="font-medium text-[#111827]">
                          {order.items}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-[#64748b]">
                      {order.date}
                    </td>
                    <td className="py-4 font-bold text-[#111827]">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        type="button"
                        className="text-xs font-bold text-[#14805f] hover:underline cursor-pointer"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
        <h2 className="text-sm font-bold text-[#111827] mb-6">
          Order History
        </h2>

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
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 font-bold text-[#111827]">
                    #{order.id}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Utensils size={13} />
                      </div>
                      <span className="font-medium text-[#111827]">
                        {order.items}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-[#64748b]">
                    {order.date}
                  </td>
                  <td className="py-4 font-bold text-[#111827]">
                    ${order.total.toFixed(2)}
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
      </div>

      {/* Live Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setTrackingOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14805f] flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Order #{trackingOrder.id}
                </h3>
                <p className="text-xs text-gray-500">Live Kitchen Tracking</p>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-4 mb-6 border border-gray-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Items:</span>
                <span className="font-semibold text-gray-800 text-right">{trackingOrder.items}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pickup Location:</span>
                <span className="font-semibold text-gray-800">Main Canteen - Building A</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-bold text-[#14805f]">{trackingOrder.status}</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#14805f] text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Order Received</p>
                  <p className="text-[10px] text-gray-400">Kitchen accepted your ticket</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#14805f] text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">In Preparation</p>
                  <p className="text-[10px] text-gray-400">Chefs are preparing fresh food</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  trackingOrder.status === 'Ready for Pickup' ? 'bg-[#14805f] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${trackingOrder.status === 'Ready for Pickup' ? 'text-gray-800' : 'text-gray-400'}`}>
                    Ready for Pickup
                  </p>
                  <p className="text-[10px] text-gray-400">Collect at Counter 2</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              type="button"
              className="w-full mt-6 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-bold py-3 rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
