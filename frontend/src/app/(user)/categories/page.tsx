"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CategoryCard, DeleteCategoryModal } from "@/features/category/components";
import type { Category } from "@/features/category/types";
import { ROUTES } from "@/lib/constants";
import { useCategories, useDeleteCategory } from "@/features/category/hooks";

/**
 * CategoriesPage — Trang quản lý danh mục.
 *
 * Use case "Xem danh sách":
 * - Truy cập trang Quản lý danh mục → GET /api/categories
 * - BE gộp danh mục Chung (COMMON) & Riêng (PRIVATE)
 * - FE hiển thị danh sách:
 *   + Danh mục Chung: chỉ hiển thị "Xem"
 *   + Danh mục Riêng: hiển thị nút "Sửa / Xoá"
 */
export default function CategoriesPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();

  // Tách danh mục COMMON và PRIVATE
  const commonCategories = Array.isArray(categories)
    ? categories.filter((c) => c.scope === "COMMON")
    : [];
  const privateCategories = Array.isArray(categories)
    ? categories.filter((c) => c.scope === "PRIVATE")
    : [];

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  /**
   * Use case "Xoá":
   * - Gửi DELETE /api/categories/{id}
   * - 403 Forbidden (danh mục chung) → Hiển thị thông báo
   * - 409 Conflict (đang có dữ liệu) → Hiển thị thông báo
   * - 200 OK → Xoá bản ghi & Cập nhật danh sách
   */
  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    setDeleteError(null);

    deleteMutation.mutate(categoryToDelete.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        setDeleteError(null);
      },
      onError: (error: any) => {
        // Hiển thị message từ server (403 hoặc 409)
        const message =
          error?.message ||
          error?.details?.message ||
          "Failed to delete category. Please try again.";
        setDeleteError(message);
      },
    });
  };

  const handleDeleteCancel = () => {
    if (deleteMutation.isPending) return;
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    setDeleteError(null);
  };

  return (
    <div className="w-full flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View common categories and manage your private categories
          </p>
        </div>
        <Link
          href={`${ROUTES.CATEGORIES}/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span>Add Category</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : (
        <>
          {/* ====== Danh mục chung (COMMON) ====== */}
          {commonCategories.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "20px" }}>
                  public
                </span>
                <h2 className="text-lg font-bold text-gray-700">
                  Common Categories
                </h2>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                  {commonCategories.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {commonCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ====== Danh mục riêng (PRIVATE) ====== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-violet-400" style={{ fontSize: "20px" }}>
                person
              </span>
              <h2 className="text-lg font-bold text-gray-700">
                Private Categories
              </h2>
              <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs font-semibold rounded-full">
                {privateCategories.length}
              </span>
            </div>
            {privateCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: "48px" }}>
                  category
                </span>
                <p className="text-gray-500 text-sm mb-4">
                  You haven't created any private categories yet.
                </p>
                <Link
                  href={`${ROUTES.CATEGORIES}/create`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first category</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {privateCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Modal */}
      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ""}
        isLoading={deleteMutation.isPending}
        errorMessage={deleteError}
      />
    </div>
  );
}
