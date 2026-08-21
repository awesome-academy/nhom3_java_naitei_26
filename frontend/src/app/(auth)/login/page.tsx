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
        router.push("/admin/dashboard");
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
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#131b2e",
            margin: "0 0 0.35rem 0",
          }}
        >
          Sign In
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
          Access your personal financial management account.
        </p>
      </div>

      {/* Card Form */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          border: "1px solid #e2e8f0",
        }}
      >
        {errorMessage && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.75rem",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "0.8125rem",
              fontWeight: "500",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.6875rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#64748b",
                marginBottom: "0.5rem",
              }}
            >
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  color: "#94a3b8",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                style={{
                  width: "100%",
                  padding: "0.6875rem 0.875rem 0.6875rem 2.625rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  color: "#1e293b",
                  outline: "none",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#004ac6";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.6875rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#64748b",
                marginBottom: "0.5rem",
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  color: "#94a3b8",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                style={{
                  width: "100%",
                  padding: "0.6875rem 0.875rem 0.6875rem 2.625rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  color: "#1e293b",
                  outline: "none",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#004ac6";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ paddingTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "#004ac6",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "600",
                borderRadius: "10px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 6px -1px rgba(0, 74, 198, 0.25)",
                transition: "background-color 0.2s",
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#003ba0";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#004ac6";
              }}
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Link chuyển sang Đăng ký */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "#64748b",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#004ac6",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}