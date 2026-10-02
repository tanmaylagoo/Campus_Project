import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  ChevronDown,
  User,
} from 'lucide-react';

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

  const stats = [
    {
      label: "Today's Orders",
      value: '128',
      icon: ShoppingBag,
      iconBg: 'bg-[#ecfdf5]',
      iconColor: 'text-[#14805f]',
    },
    {
      label: 'Pending Orders',
      value: '18',
      icon: Clock,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#ea580c]',
    },
    {
      label: 'Completed Orders',
      value: '96',
      icon: CheckCircle2,
      iconBg: 'bg-[#ecfdf5]',
      iconColor: 'text-[#059669]',
    },
    {
      label: "Today's Revenue",
      value: '₹8,450',
      icon: IndianRupee,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
    },
  ];

  const [orders, setOrders] = useState([
    {
      id: '#1042',
      customer: 'Tanmay Lagoo',
      items: [
        { name: 'Vada Pav', qty: 2 },
        { name: 'Masala Dosa', qty: 1 },
      ],
      total: 112,
      time: '2 min ago',
      status: 'PREPARING',
    },
    {
      id: '#1041',
      customer: 'Rahul Sharma',
      items: [{ name: 'Veg Sandwich', qty: 1 }],
      total: 45,
      time: '5 min ago',
      status: 'PLACED',
    },
    {
      id: '#1040',
      customer: 'Priya Patel',
      items: [
        { name: 'Samosa Pav', qty: 2 },
        { name: 'Chai', qty: 2 },
      ],
      total: 84,
      time: '8 min ago',
      status: 'ACCEPTED',
    },
    {
      id: '#1039',
      customer: 'Arjun Deshmukh',
      items: [
        { name: 'Paneer Dosa', qty: 1 },
        { name: 'Filter Coffee', qty: 1 },
      ],
      total: 108,
      time: '12 min ago',
      status: 'READY',
    },
    {
      id: '#1038',
      customer: 'Sneha Kulkarni',
      items: [{ name: 'Misal Pav', qty: 1 }],
      total: 55,
      time: '15 min ago',
      status: 'PREPARING',
    },
  ]);

  const statusConfig = {
    PLACED: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    ACCEPTED: { bg: 'bg-[#f0f9ff]', text: 'text-[#0284c7]' },
    PREPARING: { bg: 'bg-[#fff7ed]', text: 'text-[#ea580c]' },
    READY: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    COMPLETED: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
    CANCELLED: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
  };

  const statusFlow = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];

  const advanceStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const currentIdx = statusFlow.indexOf(order.status);
        if (currentIdx < statusFlow.length - 1) {
          return { ...order, status: statusFlow[currentIdx + 1] };
        }
        return order;
      })
    );
  };

  const getNextAction = (status) => {
    const actions = {
      PLACED: 'Accept',
      ACCEPTED: 'Start Preparing',
      PREPARING: 'Mark Ready',
      READY: 'Complete',
    };
    return actions[status] || null;
  };

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            {greeting}, Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Here's what's happening in your canteen today.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>{dateStr}</span>
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
          <h2 className="text-sm font-bold text-[#111827]">Current Orders</h2>
          <Link
            to="/admin-dashboard/orders"
            className="text-xs font-semibold text-[#ff7a18] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                  Order
                </th>
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Customer
                </th>
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Items
                </th>
                <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Total
                </th>
                <th className="text-center text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const sc = statusConfig[order.status];
                const nextAction = getNextAction(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold text-[#111827]">{order.id}</span>
                      <span className="text-[11px] text-[#7b8494] ml-2">{order.time}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                          <User size={13} />
                        </div>
                        <span className="text-xs font-medium text-[#172033]">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-[11px] text-[#7b8494]">
                            {item.qty}x {item.name}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-bold text-[#111827]">₹{order.total}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${sc.bg} ${sc.text}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {nextAction && (
                        <button
                          onClick={() => advanceStatus(order.id)}
                          className="text-[11px] font-semibold text-[#14805f] hover:text-[#106d50] bg-[#ecfdf5] hover:bg-[#d1fae5] px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {nextAction}
                        </button>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span className="text-[11px] text-[#7b8494]">Done</span>
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
          {orders.map((order) => {
            const sc = statusConfig[order.status];
            const nextAction = getNextAction(order.status);
            return (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827]">{order.id}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.text}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7b8494]">{order.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7b8494] shrink-0">
                    <User size={11} />
                  </div>
                  <span className="text-xs font-medium text-[#172033]">{order.customer}</span>
                </div>

                <div className="space-y-0.5 pl-8">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-[11px] text-[#7b8494]">
                      {item.qty}x {item.name}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pl-8">
                  <span className="text-xs font-bold text-[#111827]">₹{order.total}</span>
                  {nextAction && (
                    <button
                      onClick={() => advanceStatus(order.id)}
                      className="text-[11px] font-semibold text-[#14805f] bg-[#ecfdf5] hover:bg-[#d1fae5] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {nextAction}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
