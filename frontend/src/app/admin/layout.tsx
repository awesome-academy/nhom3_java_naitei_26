"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Footer from "@/components/layout/Footer";
import { Activity, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#131b2e] flex flex-col justify-between">
      {/* Sidebar Component */}
      <AdminSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Container */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>FinTrack Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}