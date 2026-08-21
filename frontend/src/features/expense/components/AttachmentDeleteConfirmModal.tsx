"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

interface AttachmentDeleteConfirmModalProps {
  fileName?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AttachmentDeleteConfirmModal({
  fileName,
  isDeleting = false,
  onCancel,
  onConfirm,
}: AttachmentDeleteConfirmModalProps) {
  useEffect(() => {
    if (!fileName) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [fileName, isDeleting, onCancel]);

  if (!fileName) {
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
        aria-labelledby="delete-attachment-title"
        aria-describedby="delete-attachment-description"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <h2 id="delete-attachment-title" className="text-lg font-semibold text-gray-900">
          Xóa file đính kèm?
        </h2>
        <p id="delete-attachment-description" className="mt-2 text-sm leading-6 text-gray-600">
          File <strong className="break-all text-gray-900">{fileName}</strong> sẽ bị xóa vĩnh viễn
          và không thể khôi phục.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Xóa file
          </Button>
        </div>
      </section>
    </div>
  );
}
