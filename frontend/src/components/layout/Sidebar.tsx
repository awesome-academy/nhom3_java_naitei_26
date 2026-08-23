"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { USER_MENU } from "@/lib/constants";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tag,
  PiggyBank,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tag,
  PiggyBank,
  BarChart3,
};

interface UserData {
  name?: string;
  email?: string;
  role?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function useStoredUser(): UserData | null {
  const userString = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem("user"),
    () => null // Giá trị mặc định khi render trên Server
  );

  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStoredUser();

  const handleLogout = () => {
    document.cookie = "access_token=; path=/; max-age=0;";
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Lấy 2 chữ cái đầu tiên làm Avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Phần trên: Logo + Nút Thêm chi tiêu + Danh sách Menu */}
        <div className="flex flex-col overflow-y-auto px-4 py-5">
          {/* Logo Brand Header */}
          <div className="mb-7 flex items-center justify-between px-2">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="15" rx="3" />
                  <path d="M2 9h20" />
                  <rect x="14" y="11" width="6" height="5" rx="1.5" fill="currentColor" />
                  <circle cx="16.5" cy="13.5" r="0.75" className="fill-blue-600" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-blue-700">
                  FinTrack Pro
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Personal Finance
                </span>
              </div>
            </Link>

            {/* Nút đóng trên Mobile */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {USER_MENU.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-all",
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Phần dưới cùng: User Profile Card & Nút Logout */}
        <div className="border-t border-slate-100 p-3.5">
          <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50">
            <div className="flex min-w-0 items-center gap-3">
              {/* Avatar viết tắt */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {getInitials(user?.name)}
              </div>

              {/* Thông tin tên & email */}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "John Smith"}
                </span>
                <span className="truncate text-xs text-slate-400">
                  {user?.email || "john.smith@example.com"}
                </span>
              </div>
            </div>

            {/* Nút Đăng xuất */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}