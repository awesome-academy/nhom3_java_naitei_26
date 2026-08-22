"use client";

import { useState } from "react";
import { Plus, PiggyBank, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import BudgetCard from "@/components/budget/BudgetCard";
import CreateEditBudgetModal from "@/components/budget/CreateEditBudgetModal";
import DeleteBudgetModal from "@/components/budget/DeleteBudgetModal";
import { useBudgets } from "@/features/budget/hooks";
import type { Budget } from "@/features/budget/types";

export default function BudgetsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const { data: budgets = [], isLoading, isError, refetch } = useBudgets(selectedYear, selectedMonth);

  const exceededBudgets = budgets.filter((b) => b.alertStatus === "EXCEEDED");
  const warningBudgets = budgets.filter((b) => b.alertStatus === "WARNING");

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý ngân sách</h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập hạn mức chi tiêu cho từng danh mục để kiểm soát tài chính hiệu quả
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Filter */}
          <div className="w-32">
            <Select
              options={Array.from({ length: 12 }, (_, i) => ({
                label: `Tháng ${i + 1}`,
                value: String(i + 1),
              }))}
              value={String(selectedMonth)}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            />
          </div>

          {/* Year Filter */}
          <div className="w-28">
            <Select
              options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
                label: `Năm ${y}`,
                value: String(y),
              }))}
              value={String(selectedYear)}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Thiết lập ngân sách
          </Button>
        </div>
      </div>

      {/* Warning / Exceeded Alerts Banner */}
      {exceededBudgets.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Cảnh báo: Bạn có {exceededBudgets.length} danh mục đã vượt ngân sách tháng này!</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {exceededBudgets.map((b) => (
                <li key={b.id}>
                  <strong>{b.categoryName}</strong>: Đã chi vượt mức ({b.spendingPercentage.toFixed(1)}%)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {warningBudgets.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Lưu ý: Có {warningBudgets.length} danh mục đã đạt trên 80% hạn mức.</p>
            <p className="text-xs mt-0.5">Hãy cân đối các khoản chi tiếp theo trong tháng.</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-5 h-56 animate-pulse bg-gray-50">
              <div />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">Không thể tải dữ liệu ngân sách</h3>
          <p className="mt-1 text-sm text-gray-500">Đã xảy ra lỗi khi kết nối với máy chủ.</p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" /> Thử lại
            </Button>
          </div>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <PiggyBank className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Chưa có ngân sách nào cho Tháng {selectedMonth}/{selectedYear}
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            Bắt đầu tạo ngân sách chi tiêu cho các danh mục cần thiết để kiểm soát chi tiêu tối ưu hơn.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" /> Thiết lập ngân sách ngay
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={(b) => setEditingBudget(b)}
              onDelete={(b) => setDeletingBudget(b)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEditBudgetModal
        isOpen={isCreateModalOpen || Boolean(editingBudget)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />

      <DeleteBudgetModal
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        budget={deletingBudget}
      />
    </div>
  );
}
