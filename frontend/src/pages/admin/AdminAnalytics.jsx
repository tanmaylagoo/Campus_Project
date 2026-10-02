import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShoppingBag, IndianRupee, Award, PieChart } from 'lucide-react';

/* ──────────────────────────────────────────
   Tiny canvas-based chart helpers
   (no library dependency, minimal footprint)
   ────────────────────────────────────────── */

const BarChart = ({ data, labels, color = '#14805f', height = 180 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const max = Math.max(...data) * 1.15;
    const barCount = data.length;
    const gap = 12;
    const barW = Math.min(36, (w - gap * (barCount + 1)) / barCount);
    const startX = (w - (barW * barCount + gap * (barCount - 1))) / 2;

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

      // bar with rounded top
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
      ctx.fillText(labels[i], x + barW / 2, h - 8);
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

const LineChart = ({ data, labels, color = '#14805f', height = 180 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const max = Math.max(...data) * 1.15;
    const padL = 8;
    const padR = 8;
    const padB = 28;
    const padT = 8;
    const drawW = w - padL - padR;
    const drawH = h - padB - padT;

    // grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + drawH * (1 - i / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // fill area
    const points = data.map((val, i) => ({
      x: padL + (drawW / (data.length - 1)) * i,
      y: padT + drawH * (1 - val / max),
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padB);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - padB);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '25');
    grad.addColorStop(1, color + '05');
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    // dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // labels
    ctx.fillStyle = '#7b8494';
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    points.forEach((p, i) => {
      ctx.fillText(labels[i], p.x, h - 8);
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

const HorizontalBarChart = ({ data, labels, colors, height = 200 }) => {
  const total = data.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      {data.map((val, i) => {
        const pct = total > 0 ? (val / total) * 100 : 0;
        return (
          <div key={labels[i]}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-[#172033]">{labels[i]}</span>
              <span className="text-[11px] font-semibold text-[#7b8494]">{val} orders</span>
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
   Admin Analytics Page
   ────────────────────────────────────────── */

const AdminAnalytics = () => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const orderData = [82, 95, 78, 110, 128, 145, 92];
  const revenueData = [5200, 6100, 4900, 7200, 8450, 9600, 5800];

  const popularItems = [
    { name: 'Vada Pav', orders: 42, revenue: 924 },
    { name: 'Masala Dosa', orders: 35, revenue: 2380 },
    { name: 'Samosa Pav', orders: 28, revenue: 616 },
    { name: 'Chai', orders: 65, revenue: 975 },
    { name: 'Filter Coffee', orders: 38, revenue: 1140 },
  ];

  const categoryData = [45, 32, 28, 18, 12];
  const categoryLabels = ['Snacks', 'Dosa', 'Beverages', 'Thali', 'Chinese'];
  const categoryColors = ['#14805f', '#ff7a18', '#0284c7', '#8b5cf6', '#ef4444'];

  const summaryStats = [
    {
      label: 'Total Orders This Week',
      value: '730',
      change: '+12%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      label: 'Weekly Revenue',
      value: '₹47,250',
      change: '+8%',
      positive: true,
      icon: IndianRupee,
    },
    {
      label: 'Avg. Order Value',
      value: '₹64.7',
      change: '+3%',
      positive: true,
      icon: TrendingUp,
    },
    {
      label: 'Top Item',
      value: 'Chai',
      change: '65 orders',
      positive: true,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
          Weekly performance overview for your canteen.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100/90 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[#7b8494] uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center">
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#111827] tracking-tight">
                {stat.value}
              </p>
              <p
                className={`text-[11px] font-medium mt-1 ${
                  stat.positive ? 'text-[#059669]' : 'text-[#dc2626]'
                }`}
              >
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders Overview */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">Orders Overview</h2>
          <BarChart data={orderData} labels={weekDays} color="#14805f" height={200} />
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-5">Revenue Overview</h2>
          <LineChart
            data={revenueData}
            labels={weekDays}
            color="#ff7a18"
            height={200}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Popular Items */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Popular Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider py-2">
                    Item
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider py-2">
                    Orders
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider py-2">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {popularItems.map((item, i) => (
                  <tr key={item.name}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#f1f5f9] text-[#7b8494] text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-[#172033]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-xs font-semibold text-[#111827]">
                      {item.orders}
                    </td>
                    <td className="py-2.5 text-right text-xs font-semibold text-[#111827]">
                      ₹{item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] mb-4">Category Performance</h2>
          <HorizontalBarChart
            data={categoryData}
            labels={categoryLabels}
            colors={categoryColors}
            height={200}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
