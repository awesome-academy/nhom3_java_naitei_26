"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useDeleteBudget } from "@/features/budget/hooks";
import type { Budget } from "@/features/budget/types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Unable to delete budget";
  }
  return "Unable to delete budget";
}

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

export default function DeleteBudgetModal({ isOpen, onClose, budget }: DeleteBudgetModalProps) {
  const deleteMutation = useDeleteBudget();

  if (!budget) return null;

  const handleDelete = () => {
    deleteMutation.mutate(budget.id, {
      onSuccess: () => {
        toast.success("Budget deleted successfully");
        onClose();
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Budget" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the budget limit for{" "}
              <strong className="text-gray-900">{budget.categoryName}</strong> (Month {budget.month}
              /{budget.year})?
            </p>
            <p className="mt-1 text-xs text-gray-500">
              This will not delete any related expense transactions.
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
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete Budget
          </Button>
        </div>
      </div>
    </Modal>
  );
}
