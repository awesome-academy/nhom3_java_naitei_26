"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useDeleteBudget } from "@/features/budget/hooks";
import type { Budget } from "@/features/budget/types";

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

export default function DeleteBudgetModal({
  isOpen,
  onClose,
  budget,
}: DeleteBudgetModalProps) {
  const deleteMutation = useDeleteBudget();

  if (!budget) return null;

  const handleDelete = () => {
    deleteMutation.mutate(budget.id, {
      onSuccess: () => {
        toast.success("Xóa ngân sách thành công");
        onClose();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Không thể xóa ngân sách");
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa ngân sách" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn xóa hạn mức ngân sách cho danh mục{" "}
              <strong className="text-gray-900">{budget.categoryName}</strong> (Tháng{" "}
              {budget.month}/{budget.year}) không?
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Hành động này không xóa các giao dịch chi tiêu liên quan.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Xác nhận xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
