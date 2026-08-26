"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryForm } from "@/features/category/components";
import { toast } from "sonner";
import { useCreateCategory } from "@/features/category/hooks";
import type { CreateCategoryDto } from "@/features/category/types";
import { ROUTES } from "@/lib/constants";

/**
 * CreateCategoryPage — Tạo danh mục riêng mới.
 *
 * Use case "Thêm danh mục":
 * - Bấm "Thêm danh mục" & nhập Form → Bấm "Lưu"
 * - Dữ liệu hợp lệ? → Gửi POST /api/categories → BE gán userId từ Token & lưu DB
 *   → Thông báo thành công & cập nhật danh sách
 * - Dữ liệu sai? → Trả về lỗi 400 Bad Request → Hiển thị lỗi tại Form
 */
export default function CreateCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCategory();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      await createMutation.mutateAsync(data);
      router.push(ROUTES.CATEGORIES);
    } catch (error: any) {
      // 400 Bad Request — hiển thị lỗi validate theo field
      if (error?.status === 400 && error?.details?.data) {
        setServerErrors(error.details.data as Record<string, string>);
      } else if (error?.status === 409) {
        // 409 Conflict - Tên danh mục trùng lặp
        setServerErrors({ name: error.message || "Danh mục này đã tồn tại" });
      } else {
        toast.error(error?.message || "Failed to create category");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
        <Link
          href={ROUTES.CATEGORIES}
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Categories</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Create new category</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Create new category
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create a private category to organize your expenses
          </p>
        </div>

        <CategoryForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          serverErrors={serverErrors}
        />
      </div>
    </div>
  );
}
