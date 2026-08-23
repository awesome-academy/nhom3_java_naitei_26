"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Menu, Wallet } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Link
        href={ROUTES.DASHBOARD}
        className="flex items-center gap-2 font-semibold text-gray-900"
      >
        <Wallet className="h-6 w-6 text-blue-600" />
        <span className="text-lg">ExpenseApp</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden text-sm text-gray-600 sm:block">
            Xin chào, <strong>{user.name}</strong>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
