"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { ROUTES } from "@/lib/constants";
import { expenseApi } from "../api";
import {
  useDeleteExpense,
  useDeleteExpenseAttachment,
  useExpense,
  useExpenseCategories,
} from "../hooks";
import type { ExpenseAttachment, ExpenseCategoryOption } from "../types";
import AttachmentDeleteConfirmModal from "./AttachmentDeleteConfirmModal";
import ExpenseDeleteConfirmModal from "./ExpenseDeleteConfirmModal";
import ExpenseFormModal from "./ExpenseFormModal";

interface ExpenseDetailContentProps {
  expenseId: number | null;
}

export default function ExpenseDetailContent({ expenseId }: ExpenseDetailContentProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<ExpenseAttachment>();
  const detailQuery = useExpense(expenseId ?? 0);
  const categoryQuery = useExpenseCategories();
  const deleteExpenseMutation = useDeleteExpense();
  const deleteAttachmentMutation = useDeleteExpenseAttachment();
  const expense = detailQuery.data;
  const categories = useMemo(
    () => mergeCurrentCategory(categoryQuery.data ?? [], expense),
    [categoryQuery.data, expense]
  );

  if (!expenseId) {
    return <DetailMessage title="Invalid expense URL" />;
  }

  if (detailQuery.isLoading) {
    return <DetailLoading />;
  }

  if (detailQuery.isError || !expense) {
    return (
      <DetailMessage
        title="Unable to load expense details"
        description="The expense does not exist, you do not have access, or there is a connection problem."
        action={<Button onClick={() => detailQuery.refetch()}>Try again</Button>}
      />
    );
  }

  const viewAttachment = async (attachment: ExpenseAttachment) => {
    try {
      const response = await expenseApi.downloadAttachment(expense.id, attachment.id);
      const objectUrl = URL.createObjectURL(response.data);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      toast.error("Unable to open the attachment");
    }
  };

  const deleteAttachment = () => {
    if (!attachmentToDelete) {
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

  const deleteExpense = () => {
    deleteExpenseMutation.mutate(expense.id, {
      onSuccess: () => {
        toast.success("Expense deleted successfully");
        router.replace(ROUTES.EXPENSES);
      },
      onError: () => toast.error("Unable to delete the expense. Please try again."),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={ROUTES.EXPENSES}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to expenses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Expense details</h1>
          <p className="mt-1 text-sm text-gray-500">View expense information and manage attachments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit expense
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete expense
          </Button>
        </div>
      </div>

      <Card>
        <dl className="grid gap-6 sm:grid-cols-2">
          <DetailField label="Expense title" value={expense.title} />
          <DetailField label="Amount" value={formatAmount(expense.amount)} highlight />
          <DetailField label="Date" value={formatDate(expense.date)} />
          <DetailField label="Category" value={expense.categoryName} />
          <DetailField label="Note" value={expense.note?.trim() || "No note"} wide />
        </dl>
      </Card>

      <Card title="Attachments" description="Select a file name to view it">
        {expense.attachments?.length ? (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {expense.attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center justify-between gap-3 p-3">
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-3 text-left text-blue-700 hover:underline"
                  onClick={() => viewAttachment(attachment)}
                >
                  <span className="rounded-lg bg-blue-50 p-2">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="truncate">{attachment.fileName}</span>
                  <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete file ${attachment.fileName}`}
                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setAttachmentToDelete(attachment)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            This expense has no attachments.
          </p>
        )}
      </Card>

      <ExpenseFormModal
        isOpen={isEditing}
        categories={categories}
        expense={expense}
        onClose={() => setIsEditing(false)}
        onSuccess={() => detailQuery.refetch()}
      />
      <AttachmentDeleteConfirmModal
        fileName={attachmentToDelete?.fileName}
        isDeleting={deleteAttachmentMutation.isPending}
        onCancel={() => setAttachmentToDelete(undefined)}
        onConfirm={deleteAttachment}
      />
      <ExpenseDeleteConfirmModal
        expenseTitle={isDeleteOpen ? expense.title : undefined}
        isDeleting={deleteExpenseMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={deleteExpense}
      />
    </div>
  );
}

function DetailField({
  label,
  value,
  highlight = false,
  wide = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className={`mt-1 break-words text-base ${highlight ? "font-semibold text-red-600" : "text-gray-900"}`}>
        {value}
      </dd>
    </div>
  );
}

function DetailLoading() {
  return (
    <div aria-label="Loading expense details" className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function DetailMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {description && <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
      <Link href={ROUTES.EXPENSES} className="mt-5 inline-block text-sm text-blue-600 hover:underline">
        Back to expenses
      </Link>
    </Card>
  );
}

function mergeCurrentCategory(
  categories: ExpenseCategoryOption[],
  expense?: { categoryId: number; categoryName: string }
) {
  if (!expense || categories.some((category) => category.id === expense.categoryId)) {
    return categories;
  }
  return [{ id: expense.categoryId, name: expense.categoryName }, ...categories];
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
