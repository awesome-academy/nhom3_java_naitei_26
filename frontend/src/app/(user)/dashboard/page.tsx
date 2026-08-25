"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Plus,
  ArrowRight,
  PiggyBank,
  Receipt,
  FileText,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ExpenseFormModal from "@/features/expense/components/ExpenseFormModal";
import { useExpenseCategories } from "@/features/expense/hooks";
import { useDashboardSummary, useCategoryExpense } from "@/features/dashboard/hooks";
import CategorySpendingChart from "@/components/dashboard/CategorySpendingChart";

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function DashboardPage() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useDashboardSummary();
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useCategoryExpense();
  const { data: categories = [] } = useExpenseCategories();

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your income, spending, balance, and budget progress for this month
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsExpenseModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng thu nhập */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {isSummaryLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              ) : isSummaryError ? (
                <span className="text-sm text-red-500">Unable to load data</span>
              ) : (
                formatCurrency(summary?.totalIncome)
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">All recorded income</p>
          </div>
        </Card>

        {/* Card 2: Tổng chi tiêu */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Expense</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {isSummaryLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              ) : isSummaryError ? (
                <span className="text-sm text-red-500">Unable to load data</span>
              ) : (
                formatCurrency(summary?.totalExpense)
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">All recorded expenses</p>
          </div>
        </Card>

        {/* Card 3: Số dư hiện tại */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Remaining Balance</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {isSummaryLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              ) : isSummaryError ? (
                <span className="text-sm text-red-500">Unable to load data</span>
              ) : (
                <span
                  className={
                    summary && summary.remainingBalance < 0 ? "text-red-600" : "text-gray-900"
                  }
                >
                  {formatCurrency(summary?.remainingBalance)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Total income - total expenses</p>
          </div>
        </Card>

        {/* Card 4: Chi tiêu tháng này */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">This Month&apos;s Spending</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {isSummaryLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              ) : isSummaryError ? (
                <span className="text-sm text-red-500">Unable to load data</span>
              ) : (
                formatCurrency(summary?.monthlyExpense)
              )}
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              Monthly income: {formatCurrency(summary?.monthlyIncome)}
            </p>
          </div>
        </Card>
      </div>

      {/* Overview Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Spending Donut Chart */}
        <div className="lg:col-span-2">
          <CategorySpendingChart
            data={categoryData}
            isLoading={isCategoryLoading}
            isError={isCategoryError}
          />
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900 border-b pb-4">Quick Access</h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/expenses"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Expense List</div>
                    <div className="text-xs text-gray-500">View and manage all transactions</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                href="/budgets"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <PiggyBank className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Budget Management</div>
                    <div className="text-xs text-gray-500">Track spending limits by category</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Reports &amp; Analytics</div>
                    <div className="text-xs text-gray-500">Review financial trends over time</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        categories={categories}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
}
