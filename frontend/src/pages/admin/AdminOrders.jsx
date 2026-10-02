import React, { useState } from 'react';
import { Search, Filter, User, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';

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

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState([
    {
      id: '#1042',
      customer: 'Tanmay Lagoo',
      items: [
        { name: 'Vada Pav', qty: 2 },
        { name: 'Masala Dosa', qty: 1 },
      ],
      total: 112,
      time: '2:45 PM',
      status: 'PREPARING',
    },
    {
      id: '#1041',
      customer: 'Rahul Sharma',
      items: [{ name: 'Veg Sandwich', qty: 1 }],
      total: 45,
      time: '2:40 PM',
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
      time: '2:32 PM',
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
      time: '2:28 PM',
      status: 'READY',
    },
    {
      id: '#1038',
      customer: 'Sneha Kulkarni',
      items: [{ name: 'Misal Pav', qty: 1 }],
      total: 55,
      time: '2:20 PM',
      status: 'COMPLETED',
    },
    {
      id: '#1037',
      customer: 'Vikram Singh',
      items: [
        { name: 'Idli Sambar', qty: 2 },
        { name: 'Vada Pav', qty: 1 },
      ],
      total: 92,
      time: '2:15 PM',
      status: 'COMPLETED',
    },
    {
      id: '#1036',
      customer: 'Ananya Joshi',
      items: [{ name: 'Pav Bhaji', qty: 1 }],
      total: 65,
      time: '2:08 PM',
      status: 'CANCELLED',
    },
    {
      id: '#1035',
      customer: 'Rohan Mehta',
      items: [
        { name: 'Masala Dosa', qty: 1 },
        { name: 'Chai', qty: 1 },
      ],
      total: 88,
      time: '1:55 PM',
      status: 'COMPLETED',
    },
  ]);

  const filters = ['All', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

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

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          Orders
        </h1>
        <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
          Manage and track all canteen orders.
        </p>
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
            placeholder="Search orders..."
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
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#7b8494] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter === 'All' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
              {filteredOrders.map((order) => {
                const sc = statusConfig[order.status];
                const nextAction = getNextAction(order.status);
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
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
                      {order.status === 'CANCELLED' && (
                        <span className="text-[11px] text-[#dc2626]">Cancelled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.map((order) => {
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

        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-[#7b8494]">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
