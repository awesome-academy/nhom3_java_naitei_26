"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bookmark,
  FileDown,
  FileUp,
  Group,
  History,
  LogOut,
  Menu,
  ReceiptText,
  Tags,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navigation = [
  { label: "User Management", href: "/admin/users", icon: Group },
  { label: "Global Categories", href: "/admin/categories", icon: Tags },
  { label: "Budget Templates", href: "/admin/budget-templates", icon: Bookmark },
  { label: "System Expenses", href: "/admin/expenses", icon: ReceiptText },
  { label: "System Incomes", href: "/admin/incomes", icon: ReceiptText },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const closeMobileMenu = () => setMobileOpen(false);
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#131b2e]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#E2E8F0] bg-white py-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-start justify-between px-6">
          <Link href="/admin/users" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-[#004ac6] text-xl font-bold text-white shadow-md">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold leading-tight">FinTrack</h1>
                <span className="rounded border border-pink-200 bg-pink-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-800">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-[#434655]">System Administration</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-1 text-[#434655] md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 text-sm font-medium">
          {navigation.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all ${
                  isActive
                    ? "border-l-4 border-[#004ac6] bg-[#eff4ff] font-semibold text-[#004ac6]"
                    : "text-[#515f74] hover:bg-[#F8FAFC] hover:text-[#131b2e]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          <div className="my-2 border-t border-[#E2E8F0]" />
          <Link
            href="/admin/data/import"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#515f74] hover:bg-[#F8FAFC] hover:text-[#131b2e]"
          >
            <FileUp className="h-5 w-5" />
            Import CSV Data
          </Link>
          <Link
            href="/admin/data/export"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[#515f74] hover:bg-[#F8FAFC] hover:text-[#131b2e]"
          >
            <FileDown className="h-5 w-5" />
            Export CSV Data
          </Link>
        </nav>

        <div className="mt-auto border-t border-[#E2E8F0] px-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
              {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name ?? "Super Admin"}</p>
              <p className="truncate text-xs text-[#434655]">
                {user?.email ?? "admin@fintrack.pro"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-[#434655] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:-mt-[100vh] md:ml-[260px]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white p-4 md:hidden">
          <div className="flex items-center gap-2 font-bold">
            <Activity className="h-5 w-5 text-[#004ac6]" />
            FinTrack Admin
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#434655]"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto w-full max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
