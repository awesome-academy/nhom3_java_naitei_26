"use client";

import {
  Landmark,
  Monitor,
  TrendingUp,
  Gift,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Income } from "../types";



interface IncomeTableProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
  isLoading?: boolean;
}

/**
 * IncomeTable — Data table chuyên cho trang Income Management.
 * Render 4 columns theo design U07:
 *   1. Income Source (icon + name + description)
 *   2. Amount (+$X,XXX.XX in emerald monospace)
 *   3. Date (MMM dd, yyyy)
 *   4. Actions (Edit + Delete icon buttons)
 */
export default function IncomeTable({
  incomes,
  onEdit,
  onDelete,
  isLoading = false,
}: IncomeTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-200" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 border-b border-gray-100"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Landmark className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            No income records found
          </p>
          <p className="text-xs text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
            <tr>
              <th scope="col" className="py-3.5 px-6">
                Income Source
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Amount
              </th>
              <th scope="col" className="py-3.5 px-4">
                Date
              </th>
              <th scope="col" className="py-3.5 px-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incomes.map((income) => {
              return (
                <tr
                  key={income.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Income Source */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 bg-blue-100 text-blue-600"
                        )}
                      >
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {income.source}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {income.note}
                        </p>
                      </div>
                    </div>
                  </td>


                  {/* Amount */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 text-base whitespace-nowrap">
                    {formatIncomeAmount(income.amount)}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                    {formatIncomeDate(income.date)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEdit(income)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                        aria-label={`Edit ${income.source}`}
                      >
                        <Pencil className="h-[18px] w-[18px]" />
                      </button>
                      <button
                        onClick={() => onDelete(income)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                        aria-label={`Delete ${income.source}`}
                      >
                        <Trash2 className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────

/**
 * Format amount thành dạng +$X,XXX.XX
 */
function formatIncomeAmount(amount: number): string {
  return `+${formatCurrency(amount)}`;
}

/**
 * Format date thành dạng "MMM dd, yyyy" (vd: Oct 05, 2026)
 */
function formatIncomeDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
