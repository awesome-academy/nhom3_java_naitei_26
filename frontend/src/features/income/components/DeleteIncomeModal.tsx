"use client";

import { AlertTriangle, Trash2, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface DeleteIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Tên nguồn thu nhập cần xóa */
  incomeName: string;
  /** Số tiền hiển thị (đã format, vd: "+$3,500.00") */
  incomeAmount: string;
  /** Trạng thái loading khi đang gọi API delete */
  isLoading?: boolean;
}

/**
 * DeleteIncomeModal — Modal xác nhận xóa income record.
 * Thiết kế theo U07_DEL design reference:
 * - Warning icon (red triangle)
 * - Tên income + amount in bold
 * - Danger notice box cảnh báo xóa vĩnh viễn
 * - Cancel + Confirm Delete buttons
 */
export default function DeleteIncomeModal({
  isOpen,
  onClose,
  onConfirm,
  incomeName,
  incomeAmount,
  isLoading = false,
}: DeleteIncomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Icon Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Delete Income Record
          </h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 font-semibold">
              &quot;{incomeName}&quot;
            </strong>{" "}
            ({incomeAmount})?
          </p>
        </div>
      </div>

      {/* Warning Notice Box */}
      <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl mb-6 flex items-start gap-2.5 text-xs text-red-900 leading-relaxed">
        <Info className="h-[18px] w-[18px] text-red-600 flex-shrink-0 mt-0.5" />
        <span>
          This action will permanently delete this income entry. Monthly total
          income and net balance will be updated immediately.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border-gray-200 bg-white text-gray-500 font-semibold hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isLoading}
          className="rounded-xl font-semibold shadow-sm"
        >
          <Trash2 className="h-[18px] w-[18px]" />
          Confirm Delete
        </Button>
      </div>
    </Modal>
  );
}
