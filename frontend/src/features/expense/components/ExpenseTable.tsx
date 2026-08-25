import { Pencil, ReceiptText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "../types";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
}

export default function ExpenseTable({
  expenses,
  isLoading = false,
  emptyMessage = "No expenses yet",
  onRowClick,
  onEdit,
}: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div aria-label="Loading expenses" className="animate-pulse space-y-3 p-6">
        <div className="h-10 rounded bg-gray-200" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th scope="col" className="px-6 py-3.5">
              Expense title
            </th>
            <th scope="col" className="px-4 py-3.5">
              Category
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Amount
            </th>
            <th scope="col" className="px-6 py-3.5">
              Date
            </th>
            {onEdit && (
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={onEdit ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500">
                <ReceiptText className="mx-auto mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
                {emptyMessage}
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr
                key={expense.id}
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-blue-50/50 focus:bg-blue-50/50 focus:outline-none"
                onClick={() => onRowClick(expense)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(expense);
                  }
                }}
              >
                <td className="px-6 py-4 font-semibold text-gray-900">{expense.title}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {expense.categoryIcon?.trim() && (
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[16px] leading-none"
                      >
                        {expense.categoryIcon}
                      </span>
                    )}
                    {expense.categoryName}
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-semibold text-red-600">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 text-gray-600">{formatDate(expense.date)}</td>
                {onEdit && (
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`Edit ${expense.title}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(expense);
                      }}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
