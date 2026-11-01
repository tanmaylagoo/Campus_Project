import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Award,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Utensils,
  BarChart2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ──────────────────────────────────────────
   Canvas-based Bar Chart helper
   ────────────────────────────────────────── */
const BarChart = ({ data = [], labels = [], color = '#14805f', height = 180 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const maxVal = Math.max(...data, 10);
    const max = maxVal * 1.15;
    const barCount = data.length;
    const gap = 12;
    const barW = Math.min(36, Math.max(14, (w - gap * (barCount + 1)) / barCount));
    const startX = Math.max(10, (w - (barW * barCount + gap * (barCount - 1))) / 2);

    // grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h - 28) * (1 - i / 4) + 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // bars
    data.forEach((val, i) => {
      const barH = ((h - 32) * val) / max;
      const x = startX + i * (barW + gap);
      const y = h - 28 - barH;

      const radius = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, h - 28);
      ctx.lineTo(x, h - 28);
      ctx.closePath();
      ctx.fill();

      // label
      ctx.fillStyle = '#7b8494';
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barW / 2, h - 8);
    });
  }, [data, labels, color, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="block"
    />
  );
};

/* ──────────────────────────────────────────
   Horizontal Bar Category / Items Breakdown
   ────────────────────────────────────────── */
const HorizontalBarChart = ({ data = [], labels = [], colors = ['#14805f', '#ff7a18', '#0284c7', '#8b5cf6', '#ef4444'], height = 180 }) => {
  const total = data.reduce((a, b) => a + b, 0);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-36 text-xs text-gray-400">
        No sales data available for this breakdown.
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      {data.map((val, i) => {
        const pct = total > 0 ? (val / total) * 100 : 0;
        return (
          <div key={labels[i] || i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-[#172033]">{labels[i]}</span>
              <span className="text-[11px] font-semibold text-[#7b8494]">
                ₹{val.toLocaleString()} ({Math.round(pct)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ──────────────────────────────────────────
   Daily Sales & Order History Center
   ────────────────────────────────────────── */
const AdminAnalytics = () => {
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [historyData, setHistoryData] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);

  // Quick helper dates
  const quickDates = (() => {
    const list = [];
    const labels = ['Today', 'Yesterday', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago', '6 Days Ago'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push({
        label: labels[i],
        dateStr: `${y}-${m}-${day}`,
        formatted: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      });
    }
    return list;
  })();

  // 1. Fetch multi-day sales history from DailySales model
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      const res = await fetch(`${API_URL}/sales/history?days=14`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load sales history');
      const data = await res.json();
      if (data.success) {
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch specific date sales & order tickets from DailySales model
  const fetchDateDetails = useCallback(async (date) => {
    try {
      setDayLoading(true);
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token');

      const res = await fetch(`${API_URL}/sales/date/${date}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load date details');
      const data = await res.json();
      if (data.success) {
        setDayDetails(data);
      }
    } catch (err) {
      console.error(`Error fetching details for date ${date}:`, err);
    } finally {
      setDayLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (selectedDate) {
      fetchDateDetails(selectedDate);
    }
  }, [selectedDate, fetchDateDetails]);

  // Prepared chart data from real historical records
  const records = historyData?.history || [];
  // Sort oldest to newest for trend graphs
  const chronRecords = [...records].reverse().slice(-7);
  const chartLabels = chronRecords.map((r) => {
    const parts = r.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });
  const revenueChartData = chronRecords.map((r) => r.totalRevenue || 0);
  const orderCountChartData = chronRecords.map((r) => r.totalOrders || 0);

  const selectedRecord = dayDetails?.record || {
    date: selectedDate,
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    categoryBreakdown: [],
    topSellingItems: [],
  };

  const ordersForDay = dayDetails?.orders || [];

  const selectedDateFormatted = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  })();

  const isToday = selectedDate === getTodayStr();

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Sales & Order History
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Real order database metrics and revenue history across every business day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchHistory();
              fetchDateDetails(selectedDate);
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} className={loading || dayLoading ? 'animate-spin' : ''} />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      {/* Date Selector Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100/90 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#14805f]" />
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Select Business Day to Inspect
            </h2>
          </div>

          {/* Custom Date Input */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-gray-400 font-medium">Specific Calendar Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#14805f] text-gray-800"
            />
          </div>
        </div>

        {/* Quick Day Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickDates.map((item) => {
            const active = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                type="button"
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#14805f] text-white shadow-xs'
                    : 'bg-[#f8fafc] text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] ${active ? 'text-emerald-100' : 'text-gray-400'}`}>
                  ({item.formatted})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Overview Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-extrabold text-[#111827]">
            {selectedDateFormatted}
            {isToday && (
              <span className="ml-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669]">
                Today (Live)
              </span>
            )}
          </h2>
          <p className="text-xs text-[#7b8494] mt-0.5">
            Database summary for {selectedDate}. Resets to 0 automatically for each new calendar day.
          </p>
        </div>
      </div>

      {/* Day Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7b8494]">Gross Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#111827] mt-3">
            ₹{(selectedRecord.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {selectedRecord.completedOrders || 0} completed orders
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7b8494]">Total Orders Placed</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#111827] mt-3">
            {selectedRecord.totalOrders || 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {isToday ? 'Accumulated today' : `Total for ${selectedDate}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7b8494]">Fulfillment Status</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-[#059669]">
                {selectedRecord.completedOrders || 0}
              </span>
              <span className="text-[11px] text-gray-400 block">Completed</span>
            </div>
            <div className="border-l border-gray-200 pl-3">
              <span className="text-lg font-bold text-[#dc2626]">
                {selectedRecord.cancelledOrders || 0}
              </span>
              <span className="text-[11px] text-gray-400 block">Cancelled</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7b8494]">Average Ticket Value</span>
            <div className="w-8 h-8 rounded-lg bg-[#fdf4ff] text-[#a855f7] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#111827] mt-3">
            ₹{(selectedRecord.averageOrderValue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Per paying order</p>
        </div>
      </div>

      {/* Customer Orders Table for Selected Day */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
          <div>
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Customer Order Tickets ({ordersForDay.length})
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Actual orders recorded for {selectedDateFormatted}
            </p>
          </div>
        </div>

        {dayLoading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin text-[#14805f] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading order tickets for {selectedDate}...</p>
          </div>
        ) : ordersForDay.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Utensils size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-semibold text-gray-700">No orders recorded on this date.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {isToday
                ? 'Orders made by customers today will appear here in real-time.'
                : 'Select another day using the calendar bar above to view sales.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Ticket #</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Dishes Ordered</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Final Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {ordersForDay.map((order) => {
                  const orderId = order.orderNumber || order.id || order._id;
                  const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-[#111827]">
                        #{orderId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                            <User size={11} />
                          </div>
                          <div>
                            <span className="font-medium text-[#111827] block">
                              {order.customerName || 'Student'}
                            </span>
                            {order.customerEmail && (
                              <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                                {order.customerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-[#111827]">
                        {order.itemsSummary || (order.items && order.items.map((i) => i.name).join(', '))}
                      </td>
                      <td className="px-4 py-3.5 text-[#7b8494]">
                        {timeStr}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-[#111827]">
                        ₹{(order.totalAmount || order.total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            order.status === 'COMPLETED'
                              ? 'bg-[#ecfdf5] text-[#059669]'
                              : order.status === 'READY'
                              ? 'bg-[#ecfdf5] text-[#059669]'
                              : order.status === 'CANCELLED'
                              ? 'bg-[#fef2f2] text-[#dc2626]'
                              : 'bg-[#fff7ed] text-[#ea580c]'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Breakdown Panels for Selected Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items on Date */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Top Selling Dishes</h3>
              <p className="text-[11px] text-gray-400">Items sold on {selectedDate}</p>
            </div>
            <Award size={16} className="text-[#14805f]" />
          </div>

          {!selectedRecord.topSellingItems || selectedRecord.topSellingItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No dish breakdown available for this day.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedRecord.topSellingItems.map((item, idx) => (
                <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-gray-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#111827]">₹{item.revenue.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 block">{item.quantity} sold</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown on Date */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Category Sales Breakdown</h3>
              <p className="text-[11px] text-gray-400">Revenue split for {selectedDate}</p>
            </div>
            <BarChart2 size={16} className="text-[#14805f]" />
          </div>

          <HorizontalBarChart
            data={(selectedRecord.categoryBreakdown || []).map((c) => c.revenue)}
            labels={(selectedRecord.categoryBreakdown || []).map((c) => c.category)}
          />
        </div>
      </div>

      {/* Multi-Day Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Daily Revenue Trend (Past 7 Days)</h3>
              <p className="text-[11px] text-gray-400">Actual daily gross sales in ₹</p>
            </div>
            <IndianRupee size={16} className="text-[#14805f]" />
          </div>
          <BarChart data={revenueChartData} labels={chartLabels} color="#14805f" height={190} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Daily Order Volume Trend</h3>
              <p className="text-[11px] text-gray-400">Number of tickets placed per day</p>
            </div>
            <ShoppingBag size={16} className="text-[#ff7a18]" />
          </div>
          <BarChart data={orderCountChartData} labels={chartLabels} color="#ff7a18" height={190} />
        </div>
      </div>

      {/* Multi-Day Database Records Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
          <div>
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Historical Daily Sales Database Records
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Stored in DailySales database collection — Click any row to inspect tickets
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Completed</th>
                <th className="px-4 py-3 text-right">Cancelled</th>
                <th className="px-4 py-3 text-right">Gross Revenue</th>
                <th className="px-4 py-3 text-right">Avg Ticket</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {records.map((r) => {
                const isCurrent = r.date === selectedDate;
                return (
                  <tr
                    key={r.date}
                    onClick={() => setSelectedDate(r.date)}
                    className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${
                      isCurrent ? 'bg-[#ecfdf5]/40 font-semibold' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5 font-bold text-[#111827]">
                      {r.date}
                      {r.date === getTodayStr() && (
                        <span className="ml-2 text-[10px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700">
                      {r.totalOrders || 0}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#059669] font-medium">
                      {r.completedOrders || 0}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#dc2626] font-medium">
                      {r.cancelledOrders || 0}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#111827]">
                      ₹{(r.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-600">
                      ₹{(r.averageOrderValue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(r.date);
                        }}
                        className="text-[11px] font-bold text-[#14805f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Day</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
