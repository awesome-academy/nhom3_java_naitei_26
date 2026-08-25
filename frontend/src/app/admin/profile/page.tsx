"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Users, 
  UserCheck, 
  Tags, 
  CheckCircle2, 
  AlertCircle, 
  Save 
} from "lucide-react";
import apiClient from "@/lib/axios";

interface StoredUserData {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

interface AdminSystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalCategories: number;
}

function useStoredUser(): StoredUserData | null {
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

export default function AdminProfilePage() {
  const storedUser = useStoredUser();

  const [name, setName] = useState<string>("");
  const [hasInitializedName, setHasInitializedName] = useState(false);

  const [systemOverview, setSystemOverview] = useState<AdminSystemOverview>({
    totalUsers: 0,
    activeUsers: 0,
    totalCategories: 0,
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (storedUser?.name && !hasInitializedName) {
    setName(storedUser.name);
    setHasInitializedName(true);
  }

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Fetch system metrics from admin endpoint or user list
        const res = await apiClient.get("/admin/users");
        const responseData = res.data?.data || res.data;
        const usersList: Array<{ status?: string }> = responseData?.content || responseData || [];

        const activeCount = usersList.filter((u) => u.status === "ACTIVE").length;
        const totalCount = responseData?.totalElements ?? usersList.length;

        setSystemOverview((prev) => ({
          ...prev,
          totalUsers: totalCount,
          activeUsers: activeCount,
        }));
      } catch {
        // Fallback default metrics if endpoint is not available
        setSystemOverview({
          totalUsers: 2,
          activeUsers: 2,
          totalCategories: 8,
        });
      }
    };

    fetchAdminStats();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoadingProfile(true);

    try {
      const res = await apiClient.put("/profile", { name });
      const updatedUser = res.data?.data || res.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: "success", text: "Administrator profile updated successfully." });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: (err as Error).message || "Unable to update administrator profile.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "AD";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administrator Profile</h1>
        <p className="text-sm text-slate-500">
          Manage system administrator credentials and inspect high-level platform status.
        </p>
      </div>

      {/* Alert Notifications */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Admin Profile Header Card */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-2xl font-bold text-white shadow-md shadow-slate-900/20">
            {getInitials(storedUser?.name)}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{storedUser?.name || "Admin User"}</h2>
              <span className="rounded-md border border-pink-200/60 bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                {storedUser?.role || "ADMIN"}
              </span>
              <span className="rounded-md border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {storedUser?.status || "ACTIVE"}
              </span>
            </div>
            <p className="text-sm text-slate-500">{storedUser?.email || "admin@example.com"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-600 border border-slate-100">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>
            {storedUser?.createdAt 
              ? `Member since ${new Date(storedUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` 
              : "Member since 2026"}
          </span>
        </div>
      </div>

      {/* System Metric Snapshot Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Active Users */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Users</span>
            <span className="text-lg font-bold text-slate-900">
              {systemOverview.activeUsers.toLocaleString()} <span className="text-xs font-medium text-slate-400">active</span>
            </span>
          </div>
        </div>

        {/* Total Registered Users */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
            <span className="text-lg font-bold text-slate-900">
              {systemOverview.totalUsers.toLocaleString()} <span className="text-xs font-medium text-slate-400">accounts</span>
            </span>
          </div>
        </div>

        {/* Global Predefined Categories */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Tags className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Categories</span>
            <span className="text-lg font-bold text-purple-700">8 <span className="text-xs font-medium text-slate-400">categories</span></span>
          </div>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-6 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Account Details</h3>
            <p className="text-xs text-slate-400">Update your public administrative profile information.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Display Name
            </label>
            <div className="relative flex items-center">
              <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Administrator Name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-10 text-sm text-slate-800 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address (Account Identifier)
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={storedUser?.email || ""}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pr-3.5 pl-10 text-sm text-slate-500 outline-none"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Administrative email identifier is permanently mapped to your role.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 disabled:opacity-70 active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              <span>{loadingProfile ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}