"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import {
  IncomeTable,
  IncomeFilterBar,
  DeleteIncomeModal,
} from "@/features/income/components";
import type { Income } from "@/features/income/types";
import { ROUTES } from "@/lib/constants";

// ─── Mock Data ─────────────────────────────────────────────
// Dữ liệu mẫu theo design reference U07 — sẽ được thay thế bằng API call.
const MOCK_INCOMES: Income[] = [
  {
    id: "1",
    source: "Tech Corp Main Salary",
    note: "Direct payroll direct deposit",
    type: "Salary",
    amount: 3500,
    date: "2026-10-05",
    description: "Tech Corp Main Salary",
    categoryId: "salary-1",
    categoryName: "Salary",
    createdAt: "2026-10-05T00:00:00Z",
    updatedAt: "2026-10-05T00:00:00Z",
  },
  {
    id: "2",
    source: "Mobile App UI Design Consulting",
    note: "Milestone 2 payment from client",
    type: "Freelance",
    amount: 1000,
    date: "2026-10-15",
    description: "Mobile App UI Design Consulting",
    categoryId: "freelance-1",
    categoryName: "Freelance",
    createdAt: "2026-10-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
];

const PAGE_SIZE = 10;

/**
 * IncomesPage — Trang Income Management (U07).
 *
 * Features:
 * - Filter bar (search, type filter, date range)
 * - Data table với income records
 * - Pagination
 * - Delete confirmation modal
 *
 * TODO: Kết nối API thực tế bằng useIncomes() hook khi backend sẵn sàng.
 */
export default function IncomesPage() {
  // ─── Filter State ──────────────────────────────────────
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("this_month");

  // ─── Pagination State ──────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);

  // ─── Delete Modal State ────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Filtered Data ─────────────────────────────────────
  // Client-side filtering trên mock data. Khi dùng API, logic filter sẽ chuyển
  // sang server-side qua query params.
  const filteredIncomes = useMemo(() => {
    let result = MOCK_INCOMES;

    // Search filter
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (income) =>
          income.source.toLowerCase().includes(query) ||
          income.note.toLowerCase().includes(query) ||
          income.amount.toString().includes(query)
      );
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((income) => income.type === typeFilter);
    }

    return result;
  }, [searchValue, typeFilter]);

  // ─── Pagination Logic ──────────────────────────────────
  const totalItems = filteredIncomes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedIncomes = filteredIncomes.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );
  const showingFrom = totalItems > 0 ? currentPage * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  // ─── Handlers ──────────────────────────────────────────
  const handleEdit = (income: Income) => {
    // TODO: Navigate to edit page khi route sẵn sàng
    console.log("Edit income:", income.id);
  };

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Gọi useDeleteIncome().mutateAsync(incomeToDelete.id) khi API sẵn sàng
      console.log("Delete income:", incomeToDelete.id);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setIncomeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setIncomeToDelete(null);
  };

  const handleReset = () => {
    setSearchValue("");
    setTypeFilter("");
    setDateFilter("this_month");
    setCurrentPage(0);
  };

  // ─── Format helper cho delete modal ────────────────────
  const formatDeleteAmount = (amount: number): string => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
    return `+${formatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Income Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track incoming cashflows, monthly salary, and freelance earnings
          </p>
        </div>
        <Link href={ROUTES.INCOMES + "/create"}>
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm active:scale-[0.98] transition-all">
            <Plus className="h-[18px] w-[18px]" />
            <span>Add New Income</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <IncomeFilterBar
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setCurrentPage(0);
        }}
        typeFilter={typeFilter}
        onTypeChange={(value) => {
          setTypeFilter(value);
          setCurrentPage(0);
        }}
        dateFilter={dateFilter}
        onDateChange={(value) => {
          setDateFilter(value);
          setCurrentPage(0);
        }}
        onReset={handleReset}
      />

      {/* Income Data Table */}
      <IncomeTable
        incomes={paginatedIncomes}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-xs text-xs text-gray-500 font-medium">
        <span>
          Showing <strong className="text-gray-900">{showingFrom} to {showingTo}</strong> of{" "}
          <strong className="text-gray-900">{totalItems}</strong> incomes
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={
                i === currentPage
                  ? "w-8 h-8 rounded-lg border border-blue-600 bg-blue-600 text-white font-semibold flex items-center justify-center text-xs"
                  : "w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 font-medium flex items-center justify-center text-xs"
              }
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteIncomeModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        incomeName={incomeToDelete?.source ?? ""}
        incomeAmount={
          incomeToDelete ? formatDeleteAmount(incomeToDelete.amount) : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
