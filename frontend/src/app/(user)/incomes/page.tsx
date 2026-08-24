"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import {
  IncomeTable,
  IncomeFilterBar,
  DeleteIncomeModal,
} from "@/features/income/components";
import type { Income } from "@/features/income/types";
import { ROUTES } from "@/lib/constants";
import { useIncomes, useDeleteIncome } from "@/features/income/hooks";

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
  const router = useRouter();

  // ─── Filter State ──────────────────────────────────────
  const [searchValue, setSearchValue] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  // ─── Pagination State ──────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);

  // ─── Delete Modal State ────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

  // ─── Compute Month Filter Param ────────────────────────
  const monthParam = useMemo(() => {
    const now = new Date();
    if (dateFilter === "this_month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    if (dateFilter === "last_month") {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    return undefined;
  }, [dateFilter]);

  // ─── Fetch Data ────────────────────────────────────────
  const { data: incomePage, isLoading } = useIncomes({
    page: currentPage,
    size: PAGE_SIZE,
    ...(monthParam ? { month: monthParam } : {}),
  });

  const deleteMutation = useDeleteIncome();

  // Client-side search filtering on current page content
  const rawIncomes = incomePage?.content || [];
  const paginatedIncomes = useMemo(() => {
    if (!searchValue.trim()) return rawIncomes;
    const q = searchValue.toLowerCase().trim();
    return rawIncomes.filter(
      (income) =>
        income.source.toLowerCase().includes(q) ||
        (income.note && income.note.toLowerCase().includes(q)) ||
        income.amount.toString().includes(q)
    );
  }, [rawIncomes, searchValue]);

  const totalItems = incomePage?.totalElements || 0;
  const totalPages = incomePage?.totalPages || 1;
  const showingFrom = totalItems > 0 ? currentPage * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  // ─── Handlers ──────────────────────────────────────────
  const handleEdit = (income: Income) => {
    router.push(`/incomes/edit/${income.id}`);
  };

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!incomeToDelete) return;

    deleteMutation.mutate(incomeToDelete.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setIncomeToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete income:", error);
      },
    });
  };

  const handleDeleteCancel = () => {
    if (deleteMutation.isPending) return;
    setDeleteModalOpen(false);
    setIncomeToDelete(null);
  };

  const handleReset = () => {
    setSearchValue("");
    setDateFilter("all");
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
        isLoading={isLoading}
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
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
