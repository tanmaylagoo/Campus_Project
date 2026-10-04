import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import axios from 'axios';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const storedUser = (() => {
    try {
      // 1. Prefer current tab's sessionStorage if it's admin
      const s = sessionStorage.getItem('user');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed?.role === 'admin') return parsed;
      }
      // 2. Check dedicated admin_user in localStorage
      const a = localStorage.getItem('admin_user');
      if (a) return JSON.parse(a);

      // 3. Fallback to localStorage.user only if role is admin
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.role === 'admin') return parsed;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const adminName = storedUser?.username || storedUser?.name || 'Admin';
  const adminEmail = storedUser?.email || 'admin@email.com';
  const avatarLetter = (adminName[0] || 'A').toUpperCase();

  const handleLogout = async () => {
    console.log('Logout button clicked');

    try {
      console.log('Calling backend logout...');
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
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
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin-dashboard/orders', icon: ClipboardList },
    { name: 'Menu', path: '/admin-dashboard/menu', icon: UtensilsCrossed },
    { name: 'Analytics', path: '/admin-dashboard/analytics', icon: BarChart3 },
  ];

  const isActiveLink = (path) => {
    if (path === '/admin-dashboard') return location.pathname === '/admin-dashboard';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
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
            const active = isActiveLink(link.path);
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/admin-dashboard'}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#1e293b] text-[#34d399] shadow-sm font-semibold'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  size={18}
                  className={active ? 'text-[#34d399]' : 'text-[#94a3b8]'}
                />
                <span>{link.name}</span>
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
          <div className="w-9 h-9 rounded-full bg-[#14805f] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-tight">{adminName}</p>
            <p className="text-[11px] text-[#94a3b8] truncate leading-tight mt-0.5">{adminEmail}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-[#111827] text-white flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#111827] text-white flex flex-col justify-between z-50 transform transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 text-[#94a3b8] hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#111827] text-white flex-col justify-between shrink-0 select-none">
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
