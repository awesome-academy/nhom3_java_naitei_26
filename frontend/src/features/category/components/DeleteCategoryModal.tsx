import { AlertTriangle, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isLoading?: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isLoading = false,
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
            <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete the category{" "}
              <strong className="text-gray-900 font-semibold">"{categoryName}"</strong>?
            </p>
          </div>
        </div>

        {/* Warning Notice Box */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl mb-6 flex items-start gap-2.5 text-xs text-red-900 leading-relaxed">
          <AlertTriangle className="w-[18px] h-[18px] text-red-600 flex-shrink-0 mt-0.5" />
          <span>
            Existing transactions in this category will be reassigned to{" "}
            <strong>"Uncategorized"</strong>. This action cannot be undone.
          </span>
        </div>

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
            <span>Confirm Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
