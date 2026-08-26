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
  AlertTriangle,
  AlertCircle,
  Check,
} from "lucide-react";
import { useBudgets } from "@/features/budget/hooks";

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

 const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
  const ackKey = `ack_budget_ids_${currentYear}_${currentMonth}`;

  // 1. Fetch danh sách ngân sách tháng hiện tại
  const { data: currentBudgets = [] } = useBudgets(currentYear, currentMonth);

  // 2. Lấy danh sách ID đã acknowledge từ localStorage
  const acknowledgedIdsStr = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem(ackKey) || "[]",
    () => "[]"
  );

  let acknowledgedIds: number[] = [];
  try {
    acknowledgedIds = JSON.parse(acknowledgedIdsStr);
  } catch {
    acknowledgedIds = [];
  }

  // 3. Lọc danh sách cảnh báo thực tế theo đúng schema budget
  const activeAlertBudgets = currentBudgets.filter((b) => {
    // Ưu tiên spendingPercentage, nếu không có thì tính từ actualSpending / amount
    const percent =
      b.spendingPercentage != null
        ? b.spendingPercentage
        : b.amount > 0
        ? ((b.actualSpending ?? 0) / b.amount) * 100
        : 0;

    const isExceeded = b.alertStatus === "EXCEEDED" || percent > 100;
    const isWarning = b.alertStatus === "WARNING" || (percent >= 80 && percent <= 100);

    return isExceeded || isWarning;
  });

  const currentAlertIds = activeAlertBudgets.map((b) => b.id);

  // 4. Kiểm tra cảnh báo chưa acknowledge
  const unacknowledgedBudgets = activeAlertBudgets.filter(
    (b) => !acknowledgedIds.includes(b.id)
  );

  const exceededCount = unacknowledgedBudgets.filter((b) => {
    const percent =
      b.spendingPercentage != null
        ? b.spendingPercentage
        : b.amount > 0
        ? ((b.actualSpending ?? 0) / b.amount) * 100
        : 0;
    return b.alertStatus === "EXCEEDED" || percent > 100;
  }).length;

  const warningCount = unacknowledgedBudgets.filter((b) => {
    const percent =
      b.spendingPercentage != null
        ? b.spendingPercentage
        : b.amount > 0
        ? ((b.actualSpending ?? 0) / b.amount) * 100
        : 0;
    return b.alertStatus === "WARNING" || (percent >= 80 && percent <= 100);
  }).length;

  const hasAlerts = unacknowledgedBudgets.length > 0;

  // 5. Lưu toàn bộ ID cảnh báo hiện tại khi bấm Acknowledge
  const handleAcknowledge = () => {
    localStorage.setItem(ackKey, JSON.stringify(currentAlertIds));
    window.dispatchEvent(new Event("storage"));
  };

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

  const isProfileActive = pathname === "/profile";

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

          {/* Ô thông báo cảnh báo ngân sách (Chỉ hiện khi có cảnh báo & chưa Acknowledge) */}
          {hasAlerts && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-xs transition-all">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {currentMonthName} {currentYear} Alerts
                </span>
              </div>

              <div className="mt-2 space-y-1 text-xs text-amber-950">
                {exceededCount > 0 && (
                  <p className="flex items-center gap-1.5 text-red-700 font-semibold">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{exceededCount} {exceededCount === 1 ? "category" : "categories"} over budget</span>
                  </p>
                )}
                {warningCount > 0 && (
                  <p className="flex items-center gap-1.5 text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 ml-1 mr-1" />
                    <span>{warningCount} {warningCount === 1 ? "category" : "categories"} near limit (≥80%)</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAcknowledge}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-amber-700 active:scale-98"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Acknowledge</span>
              </button>
            </div>
          )}

        </div>

        {/* Phần dưới cùng: User Profile Card & Nút Logout */}
        <div className="border-t border-slate-100 p-3.5">
          <div
            className={cn(
              "flex items-center justify-between rounded-xl p-2 transition-colors",
              isProfileActive
                ? "bg-blue-50/80 ring-1 ring-blue-200"
                : "hover:bg-slate-50"
            )}
          >
            {/* Box bấm chuyển sang Profile */}
            <Link
              href="/profile"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3 no-underline"
            >
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
            </Link>

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