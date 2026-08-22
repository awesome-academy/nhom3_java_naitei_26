"use client";

import { Edit2, Trash2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Budget } from "@/features/budget/types";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min(budget.spendingPercentage, 100);
  const isExceeded = budget.alertStatus === "EXCEEDED";
  const isWarning = budget.alertStatus === "WARNING";

  let progressBarColor = "bg-emerald-500";
  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle className="h-3 w-3" /> An toàn
    </span>
  );

  if (isExceeded) {
    progressBarColor = "bg-red-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle className="h-3 w-3" /> Vượt ngân sách
      </span>
    );
  } else if (isWarning) {
    progressBarColor = "bg-amber-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="h-3 w-3" /> Cảnh báo (≥80%)
      </span>
    );
  }

  const remaining = budget.amount - budget.actualSpending;

  return (
    <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header: Category & Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-base">
              {budget.categoryIcon || "🏷️"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{budget.categoryName}</h3>
              <p className="text-xs text-gray-500">
                Tháng {budget.month}/{budget.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Chỉnh sửa ngân sách"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Xóa ngân sách"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-5">
          <div className="flex justify-between items-center text-xs font-medium text-gray-600 mb-1.5">
            <span>Tiến độ chi tiêu</span>
            <span className={isExceeded ? "text-red-600 font-bold" : isWarning ? "text-amber-600 font-bold" : "text-gray-900"}>
              {budget.spendingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${progressBarColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t pt-3">
          <div>
            <span className="text-gray-500">Đã chi:</span>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">
              {formatCurrency(budget.actualSpending)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-gray-500">Hạn mức:</span>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">
              {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Remaining amount and status badge */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between">
        <div className="text-xs">
          <span className="text-gray-500">Còn lại: </span>
          <span className={`font-semibold ${remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
        {statusBadge}
      </div>
    </Card>
  );
}
