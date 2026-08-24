import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { useDeleteAdminIncome } from "../hooks";
import { AdminIncome } from "../types";
import { AlertCircle, Building2, Trash2 } from "lucide-react";

interface DeleteGlobalIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  income: AdminIncome;
}

export const DeleteGlobalIncomeModal = ({
  isOpen,
  onClose,
  income,
}: DeleteGlobalIncomeModalProps) => {
  const { mutate: deleteIncome, isPending } = useDeleteAdminIncome();

  const handleDelete = () => {
    deleteIncome(income.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
            <Building2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete System Income
              </h3>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete income entry <br />
              <span className="font-semibold text-gray-900">
                "{income.source}"
              </span>{" "}
              (<span className="text-gray-900">{formatCurrency(income.amount)}</span>)?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6 border border-gray-100 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Owner Account:</span>
                <span className="font-medium text-gray-900">
                  {income.userName} (USR-{income.userId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium text-emerald-600">
                  Income
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium text-emerald-600">
                  +{formatCurrency(income.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg mb-6 border border-red-100 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Deleting this income entry will decrease the user's recorded savings balance and log a permanent <strong>DELETE</strong> audit entry.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
