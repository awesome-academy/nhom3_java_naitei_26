"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

interface ExpenseDeleteConfirmModalProps {
  expenseTitle?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ExpenseDeleteConfirmModal({
  expenseTitle,
  isDeleting = false,
  onCancel,
  onConfirm,
}: ExpenseDeleteConfirmModalProps) {
  useEffect(() => {
    if (!expenseTitle) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [expenseTitle, isDeleting, onCancel]);

  if (!expenseTitle) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-expense-title"
        aria-describedby="delete-expense-description"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <h2 id="delete-expense-title" className="text-lg font-semibold text-gray-900">
          Xóa khoản chi?
        </h2>
        <p id="delete-expense-description" className="mt-2 text-sm leading-6 text-gray-600">
          Khoản chi <strong className="break-all text-gray-900">{expenseTitle}</strong> và toàn bộ
          file đính kèm sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Xóa khoản chi
          </Button>
        </div>
      </section>
    </div>
  );
}
