"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

/**
 * DeleteCategoryModal — Popup xác nhận xoá danh mục.
 *
 * Use case "Xoá":
 * - Bấm "Xoá" → hiển thị Popup xác nhận
 * - User xác nhận? → Gửi DELETE /api/categories/{id}
 * - Nếu 403 Forbidden (danh mục chung) → Hiển thị thông báo lỗi
 * - Nếu 409 Conflict (đang có dữ liệu) → Hiển thị thông báo lỗi
 * - Nếu 200 OK → Xoá bản ghi & cập nhật danh sách
 * - User huỷ → Đóng popup
 */
export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isLoading = false,
  errorMessage = null,
}: DeleteCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-150">
        
        {/* Icon Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
              delete_forever
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete category</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Are you sure you want to delete the category{" "}
              <strong className="text-gray-900 font-semibold">&quot;{categoryName}&quot;</strong>?
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-[18px] h-[18px] text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            This action cannot be undone. Categories can only be deleted if they are not used by any expenses or budgets.
          </span>
        </div>

        {/* Error message from API (403 / 409) */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4 flex items-start gap-2.5 text-xs text-red-900 leading-relaxed">
            <span className="material-symbols-outlined text-red-600 flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="w-[18px] h-[18px] mr-2" />
            <span>Confirm delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
