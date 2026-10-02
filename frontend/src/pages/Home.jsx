import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Utensils, MessageSquare, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { currentOrders, orderHistory } = useCart();

  // Combine recent items from current and past orders
  const recentOrders = [
    {
      id: 'recent-1',
      name: 'Teriyaki Chicken Donburi',
      time: 'Today, 12:30 PM',
      price: 8.50,
      status: 'Preparing'
    },
    {
      id: 'recent-2',
      name: 'Iced Caramel Macchiato',
      time: 'Yesterday, 9:15 AM',
      price: 4.75,
      status: 'Delivered'
    },
    {
      id: 'recent-3',
      name: 'Mozzarella Margherita Pizza',
      time: 'Oct 22, 1:10 PM',
      price: 9.20,
      status: 'Delivered'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            What would you like to take care of today?
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today, Oct 24, 2024</span>
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
            Browse daily campus menus, customize your dishes, and place swift orders directly from your favorite canteen.
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
            Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-xs font-semibold text-[#ff7a18] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="py-4.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <Utensils size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#111827] truncate">
                    {order.name}
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    {order.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <span className="text-xs font-bold text-[#111827]">
                  ₹{order.price.toFixed(2)}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${order.status === 'Preparing'
                      ? 'bg-[#fff7ed] text-[#ea580c]'
                      : 'bg-[#ecfdf5] text-[#059669]'
                    }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
