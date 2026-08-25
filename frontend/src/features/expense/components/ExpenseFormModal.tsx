"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Paperclip, Trash2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { expenseApi } from "../api";
import {
  expenseFormSchema,
  getFileValidationError,
  type ExpenseFormValues,
} from "../expenseFormSchema";
import { useCreateExpense, useDeleteExpenseAttachment, useUpdateExpense } from "../hooks";
import type { Expense, ExpenseCategoryOption } from "../types";
import AttachmentDeleteConfirmModal from "./AttachmentDeleteConfirmModal";
import ExpenseCategorySelect from "./ExpenseCategorySelect";

interface ExpenseFormModalProps {
  isOpen: boolean;
  categories: ExpenseCategoryOption[];
  expense?: Expense;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExpenseFormModal({
  isOpen,
  categories,
  expense,
  isLoadingDetail = false,
  onClose,
  onSuccess,
}: ExpenseFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    id: number;
    fileName: string;
  }>();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteAttachmentMutation = useDeleteExpenseAttachment();
  const mutation = expense ? updateMutation : createMutation;
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getDefaultValues(expense),
  });
  const files = useWatch({ control, name: "files" });

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(expense));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [expense, isOpen, reset]);

  const submit = (values: ExpenseFormValues) => {
    const existingFileCount = expense?.attachments?.length ?? 0;
    if (existingFileCount + values.files.length > 5) {
      setError("files", {
        message: `You can add up to ${Math.max(0, 5 - existingFileCount)} more files`,
      });
      return;
    }

    const input = {
      data: {
        title: values.title.trim(),
        amount: Number(values.amount),
        date: values.date,
        categoryId: Number(values.categoryId),
        note: values.note.trim() || undefined,
      },
      files: values.files,
    };
    const options = {
      onSuccess: () => {
        toast.success(expense ? "Expense updated successfully" : "Expense created successfully");
        reset(getDefaultValues());
        onClose();
        onSuccess?.();
      },
      onError: (error: { message?: string }) => {
        toast.error(error.message || "Unable to save the expense. Please try again.");
      },
    };

    if (expense) {
      updateMutation.mutate({ id: expense.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  const selectFiles = (selectedFiles: FileList | null) => {
    const nextFiles = selectedFiles ? Array.from(selectedFiles) : [];
    setValue("files", nextFiles, { shouldValidate: false });
    const validationError = getFileValidationError(nextFiles, expense?.attachments?.length ?? 0);
    if (validationError) {
      setError("files", { message: validationError });
    } else {
      clearErrors("files");
    }
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setValue("files", nextFiles, { shouldValidate: true });
    if (!getFileValidationError(nextFiles, expense?.attachments?.length ?? 0)) {
      clearErrors("files");
    }
  };

  const viewAttachment = async (attachmentId: number) => {
    if (!expense) {
      return;
    }
    try {
      const response = await expenseApi.downloadAttachment(expense.id, attachmentId);
      const fileUrl = URL.createObjectURL(response.data);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
    } catch {
      toast.error("Unable to open the attachment");
    }
  };

  const deleteExistingAttachment = () => {
    if (!expense || !attachmentToDelete) {
      return;
    }
    deleteAttachmentMutation.mutate(
      { expenseId: expense.id, attachmentId: attachmentToDelete.id },
      {
        onSuccess: () => {
          setAttachmentToDelete(undefined);
          toast.success("Attachment deleted successfully");
        },
        onError: () => toast.error("Unable to delete the attachment"),
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? "Edit expense" : "Add expense"}
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        {isLoadingDetail && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Loading expense details and existing attachments...
          </p>
        )}
        <Input label="Expense title" error={errors.title?.message} {...register("title")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
        </div>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <ExpenseCategorySelect
              id="expense-form-category"
              label="Category"
              value={field.value}
              categories={categories}
              placeholder="Select a category"
              error={errors.categoryId?.message}
              onChange={field.onChange}
            />
          )}
        />
        <div>
          <label htmlFor="expense-note" className="mb-1 block text-sm font-medium text-gray-700">
            Note
          </label>
          <textarea
            id="expense-note"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("note")}
          />
        </div>
        <div>
          {expense?.attachments && expense.attachments.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Existing attachments</p>
              <ul className="space-y-2">
                {expense.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 items-center gap-2 text-left text-blue-700 hover:underline"
                      onClick={() => viewAttachment(attachment.id)}
                    >
                      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{attachment.fileName}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete file ${attachment.fileName}`}
                      className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        setAttachmentToDelete({
                          id: attachment.id,
                          fileName: attachment.fileName,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <label htmlFor="expense-files" className="mb-1 block text-sm font-medium text-gray-700">
            {expense ? "Add new attachments" : "Attachments"}
          </label>
          <input
            ref={fileInputRef}
            id="expense-files"
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700"
            onChange={(event) => selectFiles(event.target.files)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Up to 5 files, 5MB per file. JPEG, PNG, and PDF are supported.
          </p>
          {errors.files?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.files.message}</p>
          )}
          {files.length > 0 && (
            <ul className="mt-2 space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove file ${file.name}`}
                    className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {expense ? "Save changes" : "Create expense"}
          </Button>
        </div>
      </form>
      <AttachmentDeleteConfirmModal
        fileName={attachmentToDelete?.fileName}
        isDeleting={deleteAttachmentMutation.isPending}
        onCancel={() => setAttachmentToDelete(undefined)}
        onConfirm={deleteExistingAttachment}
      />
    </Modal>
  );
}

function getDefaultValues(expense?: Expense): ExpenseFormValues {
  return {
    title: expense?.title ?? "",
    amount: expense ? String(expense.amount) : "",
    date: expense?.date ?? "",
    categoryId: expense ? String(expense.categoryId) : "",
    note: expense?.note ?? "",
    files: [],
  };
}
