"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_MENU } from "@/lib/constants";
import {
  Users,
  Tag,
  FileText,
  Receipt,
  Wallet,
  Activity,
  FileUp,
  FileDown,
  LogOut,
  X,
  LayoutDashboard,
} from "lucide-react";

// Ánh xạ icon tương ứng với chuỗi string khai báo trong ADMIN_MENU
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Tag,
  FileText,
  Receipt,
  Wallet,
  Activity,
};

const dataActions = [
  { label: "Import CSV Data", href: "/admin/data/import", icon: FileUp },
  { label: "Export CSV Data", href: "/admin/data/export", icon: FileDown },
];

interface UserData {
  name?: string;
  email?: string;
  role?: string;
}

interface AdminSidebarProps {
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
    () => null
  );

  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isProfileActive = pathname === "/admin/profile";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Dark Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-gray-800 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
          {/* Logo Header */}
          <div className="mb-6 flex items-center justify-between px-2">
            <Link href="/admin/users" className="flex items-center gap-3 no-underline">
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
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    FinTrack
                  </span>
                  <span className="rounded border border-pink-200/40 bg-pink-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-400">
                    ADMIN
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  System Administration
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-gray-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links Rendered from ADMIN_MENU */}
          <nav className="flex flex-col gap-1">
            {ADMIN_MENU.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-800 font-semibold text-white ring-1 ring-amber-500/40 shadow-xs"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-amber-500" : "text-gray-500 group-hover:text-gray-400"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-2.5 border-t border-gray-800" />

            {/* CSV Import & Export Actions */}
            {dataActions.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-800 font-semibold text-white ring-1 ring-amber-500/40 shadow-xs"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-amber-500" : "text-gray-500 group-hover:text-gray-400"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Card & Logout */}
        <div className="border-t border-gray-800 p-3.5">
          <div
            className={cn(
              "flex items-center justify-between rounded-xl p-2 transition-all",
              isProfileActive
                ? "bg-gray-800 ring-1 ring-amber-500/50"
                : "hover:bg-gray-800/60"
            )}
          >
            <Link
              href="/admin/profile"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3 no-underline"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/20 text-xs font-bold text-amber-400">
                {getInitials(user?.name)}
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold text-gray-200">
                  {user?.name || "Admin User"}
                </span>
                <span className="truncate text-[11px] text-gray-400">
                  {user?.email || "admin@example.com"}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}