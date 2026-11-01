import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  User,
  RefreshCw,
  Bell,
  Loader2,
  BarChart3,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const today = new Date();
  const hour = today.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const [orders, setOrders] = useState([]);
  const [statsData, setStatsData] = useState({
    todayOrdersCount: 0,
    pendingCount: 0,
    readyCount: 0,
    completedCount: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchVendorOrders = useCallback(async () => {
    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      // Get local client calendar date (YYYY-MM-DD)
      const clientDate = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();

      const response = await fetch(`${API_URL}/orders?scope=today&date=${clientDate}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch vendor orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) {
          setStatsData(data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading vendor orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendorOrders();
    const interval = setInterval(fetchVendorOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchVendorOrders]);

  const stats = [
    {
      label: "Today's Orders",
      value: String(statsData.todayOrdersCount),
      icon: ShoppingBag,
      iconBg: 'bg-[#ecfdf5]',
      iconColor: 'text-[#14805f]',
    },
    {
      label: 'Pending Prep',
      value: String(statsData.pendingCount),
      icon: Clock,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#ea580c]',
    },
    {
      label: 'Ready for Pickup',
      value: String(statsData.readyCount),
      icon: Bell,
      iconBg: 'bg-[#ecfdf5]',
      iconColor: 'text-[#059669]',
    },
    {
      label: "Today's Revenue",
      value: `₹${(statsData.todayRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
    },
  ];

  const statusConfig = {
    PLACED: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    ACCEPTED: { bg: 'bg-[#f0f9ff]', text: 'text-[#0284c7]' },
    PREPARING: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    READY: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    COMPLETED: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    CANCELLED: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
  };

  const statusFlow = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];

  const getNextAction = (status) => {
    const s = String(status).toUpperCase();
    const actions = {
      PLACED: 'Accept Ticket',
      ACCEPTED: 'Start Preparing',
      PREPARING: 'Mark Ready',
      READY: 'Mark Completed',
    };
    return actions[s] || null;
  };

  const advanceStatus = async (order) => {
    const orderId = order.orderNumber || order.id || order._id;
    const currentStatus = String(order.status).toUpperCase();
    const currentIdx = statusFlow.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx >= statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIdx + 1];
    setActionLoading(orderId);

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');

      // Update in state immediately
      setOrders((prev) =>
        prev.map((o) =>
          (o.orderNumber || o.id || o._id) === orderId ? data.order : o
        )
      );
      fetchVendorOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            {greeting}, Vendor
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Live kitchen ticket management and canteen overview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin-dashboard/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecfdf5] border border-emerald-200 text-xs font-semibold text-[#059669] hover:bg-[#d1fae5] shadow-xs transition-colors cursor-pointer"
          >
            <BarChart3 size={13} />
            <span>Sales of Other Days</span>
          </Link>

          <button
            onClick={() => fetchVendorOrders()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
            <Calendar size={14} className="text-gray-400" />
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[#7b8494] uppercase tracking-wide">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}
                >
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#111827] tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current Orders */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#111827]">Live Kitchen Tickets</h2>
            <span className="bg-[#ecfdf5] text-[#10b981] text-[11px] font-bold px-2 py-0.5 rounded-full">
              {orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length} In Queue
            </span>
          </div>
          <Link
            to="/admin-dashboard/orders"
            className="text-xs font-semibold text-[#ff7a18] hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin text-[#14805f] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading live kitchen tickets...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xs font-medium">No customer orders placed yet today.</p>
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                      Order Ticket
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Customer
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Dishes Ordered
                    </th>
                    <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Total
                    </th>
                    <th className="text-center text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Current Status
                    </th>
                    <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                      Kitchen Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.slice(0, 15).map((order) => {
                    const orderId = order.orderNumber || order.id;
                    const sc = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                    const nextAction = getNextAction(order.status);
                    const isBusy = actionLoading === orderId;

                    return (
                      <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-bold text-[#111827]">#{orderId}</span>
                          <span className="text-[11px] text-[#7b8494] ml-2 block sm:inline">
                            {order.date || 'Today'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                              <User size={13} />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-[#172033] block">
                                {order.customerName || 'Student'}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                📍 {order.pickupLocation || 'Main Canteen'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-xs font-medium text-[#111827] truncate">
                            {order.items}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Prep Window: ~{order.avgPrepTimeMinutes || 5} mins
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-xs font-bold text-[#111827] block">
                            ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                          </span>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                              order.paymentMethod !== 'Pay at Counter'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.paymentMethod !== 'Pay at Counter'
                              ? 'Online • Paid'
                              : 'Counter'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${sc.bg} ${sc.text}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {nextAction ? (
                            <button
                              onClick={() => advanceStatus(order)}
                              disabled={isBusy}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 ${
                                order.status === 'PREPARING'
                                  ? 'bg-[#10b981] hover:bg-[#059669] text-white animate-pulse'
                                  : 'bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#14805f]'
                              }`}
                            >
                              {isBusy && <Loader2 size={12} className="animate-spin" />}
                              <span>{nextAction}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#7b8494] font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.slice(0, 15).map((order) => {
                const orderId = order.orderNumber || order.id;
                const sc = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                const nextAction = getNextAction(order.status);
                const isBusy = actionLoading === orderId;

                return (
                  <div key={orderId} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111827]">#{orderId}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.text}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7b8494]">{order.date || 'Today'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                        <User size={11} />
                      </div>
                      <span className="text-xs font-medium text-[#172033]">
                        {order.customerName || 'Student'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium pl-8">{order.items}</p>

                    <div className="flex items-center justify-between pl-8">
                      <div>
                        <span className="text-xs font-bold text-[#111827] block">
                          ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                        </span>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            order.paymentMethod !== 'Pay at Counter'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.paymentMethod !== 'Pay at Counter'
                            ? 'Online • Paid'
                            : 'Counter'}
                        </span>
                      </div>
                      {nextAction && (
                        <button
                          onClick={() => advanceStatus(order)}
                          disabled={isBusy}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            order.status === 'PREPARING'
                              ? 'bg-[#10b981] text-white'
                              : 'bg-[#ecfdf5] text-[#14805f]'
                          }`}
                        >
                          {isBusy && <Loader2 size={12} className="animate-spin" />}
                          <span>{nextAction}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
