"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { CategoryAdminResponse } from "@/features/admin-category/types";
import { useDeleteAdminCategory } from "@/features/admin-category/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryAdminResponse | null;
}

export default function DeleteGlobalCategoryModal({ isOpen, onClose, category }: Props) {
  const { mutate: deleteCategory, isPending } = useDeleteAdminCategory();

  if (!isOpen || !category) return null;

  const handleDelete = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-500/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Delete Global Category
                <span className="rounded bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-600">ADMIN</span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to delete system category <br/>
                <span className="font-semibold text-slate-700">"{category.name}"</span>?
              </p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="px-6 pb-6">
          <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-800 leading-relaxed">
              <span className="font-semibold">This is a global system category with {category.usageCount.toLocaleString()} linked user transactions.</span> Deletion will flag all linked transactions across all user accounts as "Uncategorized".
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border-slate-200 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-red-600 focus:ring-offset-2"
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete Global Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}
