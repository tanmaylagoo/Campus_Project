import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6f8] font-sans antialiased text-[#172033]">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen p-6 pt-16 md:p-8 md:pt-8 lg:p-10 lg:pt-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
