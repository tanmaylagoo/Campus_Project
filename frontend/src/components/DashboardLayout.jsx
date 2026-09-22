import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f3f4f8] font-sans antialiased text-[#1f2937]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen p-8 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
