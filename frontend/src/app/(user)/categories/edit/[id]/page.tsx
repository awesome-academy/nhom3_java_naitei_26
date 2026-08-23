"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "@/features/category/components";
import { useUpdateCategory } from "@/features/category/hooks";
import { categoryApi } from "@/features/category/api";
import type { CreateCategoryDto, Category } from "@/features/category/types";
import { ROUTES } from "@/lib/constants";

/**
 * EditCategoryPage — Sửa danh mục riêng.
 *
 * Use case "Sửa":
 * - Bấm "Sửa" & gửi PUT /api/categories/{id}
 * - Là danh mục chung? → 403 Forbidden → Thông báo: "Không thể sửa danh mục chung"
 * - Không tồn tại / Không chính chủ? → 404 Not Found
 * - Danh mục đã được dùng trong 1 expense/income? → 409 Conflict
 *   → Thông báo: "Không thể đổi loại danh mục đã phát sinh dữ liệu"
 * - Hợp lệ → Cập nhật DB & Trả về 200 OK → Thông báo thành công & cập nhật danh sách
 */
export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const updateMutation = useUpdateCategory();

  // Load category data for pre-filling the form
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await categoryApi.getById(categoryId);
        setCategory(res.data as Category);
      } catch (error: any) {
        if (error?.status === 404) {
          setGeneralError("Category not found or you don't have permission.");
        } else {
          setGeneralError("Failed to load category information.");
        }
      } finally {
        setIsLoadingCategory(false);
      }
    };
    loadCategory();
  }, [categoryId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerErrors({});
    setGeneralError(null);

    try {
      await updateMutation.mutateAsync({ id: categoryId, data });
      router.push(ROUTES.CATEGORIES);
    } catch (error: any) {
      const status = error?.status;

      if (status === 400 && error?.details?.data) {
        // 400 Bad Request — lỗi validate theo field
        setServerErrors(error.details.data as Record<string, string>);
      } else if (status === 403) {
        // 403 Forbidden — danh mục chung
        setGeneralError(error?.message || "Cannot edit a common category");
      } else if (status === 404) {
        // 404 Not Found — không tồn tại / không chính chủ
        setGeneralError(error?.message || "Category not found or you don't have permission");
      } else if (status === 409) {
        // 409 Conflict — đổi type danh mục đang có dữ liệu
        setGeneralError(error?.message || "Cannot change the type of a category with associated data");
      } else {
        setGeneralError("An error occurred, please try again.");
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
        <span className="text-gray-900 font-semibold">Edit category</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Edit category
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Update the category's name, description, and icon
          </p>
        </div>

        {isLoadingCategory ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : category ? (
          <CategoryForm
            initialData={{
              name: category.name,
              description: category.description || "",
              icon: category.icon || "restaurant",
              type: category.type,
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            serverErrors={serverErrors}
            generalError={generalError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            {generalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-900 leading-relaxed mb-4">
                <span className="material-symbols-outlined text-red-600 flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
                  error
                </span>
                <span>{generalError}</span>
              </div>
            )}
            <Link
              href={ROUTES.CATEGORIES}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to list
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
