import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";


/**
 * Font: Inter — clean, modern, dễ đọc cho app quản lý.
 * Dùng Google Fonts qua next/font để tối ưu performance.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Expense Management System",
  description: "Hệ thống quản lý chi tiêu cá nhân",
};

/**
 * Root Layout — entry point cho toàn bộ app.
 * Chứa font, meta, và các Provider toàn cục (React Query, Toast, Auth).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
