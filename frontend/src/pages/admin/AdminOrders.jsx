import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  User,
  ChevronDown,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  Bell,
  Utensils,
  Calendar,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOrders = () => {
  const statusConfig = {
    PLACED: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    ACCEPTED: { bg: 'bg-[#f0f9ff]', text: 'text-[#0284c7]' },
    PREPARING: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    READY: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    COMPLETED: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    CANCELLED: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
  };

  const statusFlow = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  const filters = ['All', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'yesterday', 'all', 'custom'
  const [customDate, setCustomDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      const params = new URLSearchParams();
      if (dateFilter === 'today') params.append('date', 'today');
      else if (dateFilter === 'yesterday') params.append('date', 'yesterday');
      else if (dateFilter === 'custom' && customDate) params.append('date', customDate);
      else if (dateFilter === 'all') params.append('date', 'all');

      if (activeFilter !== 'All') params.append('status', activeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`${API_URL}/orders?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, customDate, activeFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (order, targetStatus) => {
    const orderId = order.orderNumber || order.id || order._id;
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
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');

      setOrders((prev) =>
        prev.map((o) =>
          (o.orderNumber || o.id || o._id) === orderId ? data.order : o
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const advanceStatus = (order) => {
    const s = String(order.status).toUpperCase();
    const idx = statusFlow.indexOf(s);
    if (idx !== -1 && idx < statusFlow.length - 1) {
      updateStatus(order, statusFlow[idx + 1]);
    }
  };

  const getNextAction = (status) => {
    const s = String(status).toUpperCase();
    const actions = {
      PLACED: 'Accept Ticket',
      ACCEPTED: 'Start Preparing',
      PREPARING: 'Mark Ready',
      READY: 'Complete Order',
    };
    return actions[s] || null;
  };

  const filteredOrders = orders.filter((order) => {
    const s = String(order.status).toUpperCase();
    const matchesFilter = activeFilter === 'All' || s === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
      (order.id && String(order.id).toLowerCase().includes(q)) ||
      (order.items && order.items.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Real customer tickets, kitchen fulfillment status, and order date history.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-[#14805f]" />
          <span className="text-xs font-bold text-[#111827]">Order Date:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDateFilter('today')}
              type="button"
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-[#14805f] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              type="button"
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'yesterday'
                  ? 'bg-[#14805f] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter('all')}
              type="button"
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-[#14805f] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
          </div>
        </div>

        {/* Custom date input */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-medium">Or Pick Date:</span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setDateFilter('custom');
            }}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#14805f]"
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8494]"
          />
          <input
            type="text"
            placeholder="Search by ticket #, customer, dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#7b8494] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter === 'All' ? 'All Statuses' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin text-[#14805f] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading customer orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-[#7b8494]">No orders found for the selected date and filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                      Order Ticket
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Customer
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Ordered Items
                    </th>
                    <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Total
                    </th>
                    <th className="text-center text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => {
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
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                              <User size={12} />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-[#172033] block">
                                {order.customerName || 'Customer'}
                              </span>
                              {order.customerEmail && (
                                <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                                  {order.customerEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-xs font-medium text-[#111827] truncate">
                            {order.items}
                          </p>
                          <span className="text-[10px] text-[#7b8494]">
                            Prep Window: ~{order.avgPrepTimeMinutes || 5}m
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
                          <div className="inline-flex items-center gap-2">
                            {nextAction && (
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
                            )}

                            {/* Status Change Dropdown */}
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order, e.target.value)}
                                disabled={isBusy}
                                className="text-[11px] font-medium bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#14805f]"
                              >
                                {statusFlow.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredOrders.map((order) => {
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
                        {order.customerName || 'Customer'}
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
                          {isBusy && <Loader2 size={11} className="animate-spin" />}
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

export default AdminOrders;
