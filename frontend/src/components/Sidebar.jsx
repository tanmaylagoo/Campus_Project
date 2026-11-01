import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Utensils, Home, ShoppingBag, UtensilsCrossed, MessageSquare, LogOut } from 'lucide-react';
import axios from 'axios';

const Sidebar = () => {
  const navigate = useNavigate();

  // Retrieve user or fallback to mockup user
  const storedUser = (() => {
    try {
      // 1. Prefer current tab's sessionStorage if it's customer
      const s = sessionStorage.getItem('user');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed?.role !== 'admin') return parsed;
      }
      // 2. Check dedicated customer_user in localStorage
      const c = localStorage.getItem('customer_user');
      if (c) return JSON.parse(c);

      // 3. Fallback to localStorage.user only if role is not admin
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.role !== 'admin') return parsed;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const userName = storedUser?.username || storedUser?.name || storedUser?.fullName || 'User';
  const userEmail = storedUser?.email || '';
  const avatarLetter = (userName[0] || 'U').toUpperCase();

  const handleLogout = async () => {
    console.log('Customer logout button clicked');

    try {
      console.log('Calling backend logout...');
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('customer_token') ||
        localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log('Backend logout successful:', response.data);
    } catch (error) {
      console.error('Logout failed:', error);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('canteen_my_order_ids');
      localStorage.removeItem('canteen_cart');
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { name: 'Canteen Chatbot', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#111827] text-white flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 pt-7 pb-8">
          <div className="w-9 h-9 rounded-lg bg-[#14805f] flex items-center justify-center text-white shadow-sm">
            <Utensils size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CanteenHub</span>
        </div>

        {/* Navigation Links */}
        <nav className="px-3.5 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1e293b] text-[#34d399] shadow-sm font-semibold'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? 'text-[#34d399]' : 'text-[#94a3b8]'}
                    />
                    <span>{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Logout */}
      <div className="px-5 pb-6 pt-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-2.5 text-xs font-semibold text-[#f87171] hover:text-red-300 transition-colors py-2 px-2 rounded-lg hover:bg-red-500/10 w-full mb-3"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>

        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/5">
          {storedUser?.avatar || storedUser?.image ? (
            <img
              src={storedUser.avatar || storedUser.image}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#14805f] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {avatarLetter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-tight">{userName}</p>
            <p className="text-[11px] text-[#94a3b8] truncate leading-tight mt-0.5">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
