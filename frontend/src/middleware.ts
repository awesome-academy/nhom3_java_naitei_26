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

// Các route cần đăng nhập
const protectedPaths = [
  "/dashboard",
  "/expenses",
  "/incomes",
  "/categories",
  "/budgets",
  "/reports",
  "/admin",
];

// Các route chỉ dành cho khách (chưa login)
const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: Thay bằng logic verify token thực tế khi backend sẵn sàng
  // Hiện tại đọc token từ cookie hoặc bỏ qua middleware để dev dễ hơn
  const token = request.cookies.get("access_token")?.value;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // Chưa login mà vào route protected → redirect /login
  // TODO: Bỏ comment dòng dưới khi muốn bật auth check
  
  // Nếu auth check lỗi hãy cmt cụm if dưới đây để dev dễ hơn
  if (isProtected && !token) {
     const loginUrl = new URL("/login", request.url);
     loginUrl.searchParams.set("redirect", pathname);
     return NextResponse.redirect(loginUrl);
  }

  // Đã login mà vào /login → redirect /dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
