"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { token, refreshToken, user } = res.data;

      document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("access_token", token);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user?.role === "ADMIN") {
        router.push("/admin/users");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error).message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tiêu đề trang */}
      <div className="mb-6 text-center">
        <h2 className="mb-1.5 text-xl font-bold text-slate-900">
          Sign In
        </h2>
        <p className="m-0 text-sm text-slate-500">
          Access your personal financial management account.
        </p>
      </div>

      {/* Card Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@fintrack.pro"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-10.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-10.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Link chuyển sang Đăng ký */}
        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 no-underline transition-colors hover:text-blue-700 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}