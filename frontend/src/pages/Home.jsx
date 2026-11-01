import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Utensils, MessageSquare, ArrowRight, Clock, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { currentOrders, orderHistory } = useCart();

  // Combine real active and past orders from backend
  const allUserOrders = [...currentOrders, ...orderHistory];

  const getStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'READY') {
      return (
        <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-bold px-2.5 py-1 rounded-md animate-pulse">
          Ready for Pickup
        </span>
      );
    }
    if (s === 'PREPARING' || s === 'ACCEPTED' || s === 'PLACED') {
      return (
        <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-semibold px-2.5 py-1 rounded-md">
          {s === 'PREPARING' ? 'Preparing' : s === 'ACCEPTED' ? 'In Kitchen' : 'Order Placed'}
        </span>
      );
    }
    if (s === 'COMPLETED' || s === 'DELIVERED') {
      return (
        <span className="bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold px-2.5 py-1 rounded-md">
          Completed
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Order fresh meals from your campus canteen and track preparation in real-time.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today's Menu</span>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Food Card */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-7 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shadow-xs">
            <Utensils size={20} />
          </div>

          <h2 className="text-lg font-bold text-[#111827] mt-5 mb-2">
            Order Food
          </h2>
          <p className="text-xs text-[#64748b] leading-relaxed mb-6">
            Browse daily campus menus, add to cart, and track your order live with automated meal readiness alerts.
          </p>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs"
          >
            Order Now <ArrowRight size={14} />
          </Link>
        </div>

        {/* Chat with Bot Card */}
        <div className="bg-white rounded-2xl border border-gray-100/90 p-7 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shadow-xs">
            <MessageSquare size={20} />
          </div>

          <h2 className="text-lg font-bold text-[#111827] mt-5 mb-2">
            Chat with Bot
          </h2>
          <p className="text-xs text-[#64748b] leading-relaxed mb-6">
            Ask our smart canteen assistant about ingredients, hours, allergen warnings, or get instant lunch recommendations.
          </p>

          <Link
            to="/chatbot"
            className="inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs"
          >
            Start Chat <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#111827]">
            My Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-xs font-semibold text-[#ff7a18] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {allUserOrders.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs">
            <p>No orders placed yet today.</p>
            <Link to="/menu" className="text-[#14805f] font-semibold hover:underline mt-1 inline-block">
              Browse menu to order fresh food
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {allUserOrders.slice(0, 4).map((order) => (
              <div
                key={order.orderNumber || order.id}
                className="py-4.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <Utensils size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#111827] truncate">
                      {order.items}
                    </h3>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      #{order.orderNumber || order.id} • {order.date || 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <span className="text-xs font-bold text-[#111827]">
                    ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
