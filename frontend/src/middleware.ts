import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — kiểm tra authentication trước khi truy cập các route protected.
 *
 * Cách hoạt động:
 * - Kiểm tra cookie/header có chứa token không
 * - Nếu chưa login → redirect về /login
 * - Nếu đã login mà vào /login → redirect về /dashboard
 *
 * TODO: Khi auth backend sẵn sàng, thay thế logic kiểm tra token bằng verify thực tế.
 * Hiện tại chỉ kiểm tra sự tồn tại của token trong cookie (chưa verify signature).
 */

// Route dành riêng cho Admin
const adminPaths = ["/admin"];

// Route dành cho User thông thường
const userPaths = [
  "/dashboard",
  "/expenses",
  "/incomes",
  "/categories",
  "/budgets",
  "/reports",
  "/profile",
];

// Các route chỉ dành cho khách (chưa login)
const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Hàm helper giải mã role từ payload của JWT token
function getRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    
    // Tự động map theo các định dạng Spring Security JWT thông dụng (role, roles, authorities, scope)
    if (payload.role) return String(payload.role).replace("ROLE_", "");
    if (Array.isArray(payload.roles) && payload.roles.length > 0) {
      return String(payload.roles[0]).replace("ROLE_", "");
    }
    if (Array.isArray(payload.authorities) && payload.authorities.length > 0) {
      return String(payload.authorities[0].authority || payload.authorities[0]).replace("ROLE_", "");
    }
    if (typeof payload.scope === "string") {
      return payload.scope.replace("ROLE_", "");
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token")?.value;
  // Đọc role từ cookie riêng (nếu có) hoặc parse trực tiếp từ JWT
  const userRole = request.cookies.get("user_role")?.value || getRoleFromToken(token) || "USER";

  const isAdminRoute = adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isUserRoute = userPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isProtected = isAdminRoute || isUserRoute;
  const isAuthPage = authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // 1. Chưa login mà truy cập route được bảo vệ -> Redirect về /login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Đã login mà vào trang auth (/login, /signup) -> Chuyển hướng đúng dashboard theo role
  if (isAuthPage && token) {
    const redirectTarget = userRole === "ADMIN" ? "/admin/users" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  // 3. User thường cố truy cập route của Admin -> Đá về /dashboard
  if (isAdminRoute && token && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Admin cố truy cập route của User thường -> Đá về /admin/users
  if (isUserRoute && token && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Khớp toàn bộ request ngoại trừ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, .jpg, ...)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};