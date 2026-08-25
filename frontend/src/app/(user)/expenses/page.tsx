"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ExpensePaginationSummary from "@/features/expense/components/ExpensePaginationSummary";
import ExpenseTable from "@/features/expense/components/ExpenseTable";
import ExpenseFilters from "@/features/expense/components/ExpenseFilters";
import ExpenseFormModal from "@/features/expense/components/ExpenseFormModal";
import { toExpenseFilter, validateExpenseFilters } from "@/features/expense/filterUtils";
import { useExpense, useExpenseCategories, useExpenses } from "@/features/expense/hooks";
import type { Expense, ExpenseFilterValues } from "@/features/expense/types";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 10;
const DEFAULT_SORT = "date,desc";
const INITIAL_FILTERS: ExpenseFilterValues = {
  search: "",
  categoryId: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

/**
 * Trang danh sách Chi tiêu.
 * Bảng danh sách + phân trang (#98960). Filter/tìm kiếm ở #98961, thêm/sửa ở #98962.
 */
export default function ExpensesPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense>();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 300);
  const effectiveValues = { ...filters, search: debouncedSearch };
  const filterErrors = validateExpenseFilters(effectiveValues);
  const isFilterValid = Object.keys(filterErrors).length === 0;
  const { data, isLoading, isFetching, isError, refetch } = useExpenses(
    {
      page,
      size: PAGE_SIZE,
      sort: DEFAULT_SORT,
      ...toExpenseFilter(effectiveValues),
    },
    isFilterValid
  );
  const categoryQuery = useExpenseCategories();
  const editingExpenseQuery = useExpense(editingExpense?.id ?? 0);
  const fallbackCategories = useMemo(() => {
    const categories = new Map<number, { name: string; icon?: string | null }>();
    data?.items.forEach((expense) =>
      categories.set(expense.categoryId, {
        name: expense.categoryName,
        icon: expense.categoryIcon,
      })
    );
    return Array.from(categories, ([id, category]) => ({ id, ...category }));
  }, [data?.items]);
  const categories = categoryQuery.data?.length ? categoryQuery.data : fallbackCategories;
  const hasActiveFilter = Object.values(filters).some(Boolean);

  const changeFilter = (field: keyof ExpenseFilterValues, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your expenses</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </div>

      <ExpenseFilters
        values={filters}
        categories={categories}
        errors={filterErrors}
        isCategoryFallback={categoryQuery.isError && fallbackCategories.length > 0}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" aria-hidden="true" />
            <p className="font-medium text-gray-900">Unable to load expenses</p>
            <p className="text-sm text-gray-500">Check your connection and try again.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <ExpenseTable
              expenses={data?.items ?? []}
              isLoading={isLoading}
              emptyMessage={
                hasActiveFilter ? "No matching expenses found" : "No expenses yet"
              }
              onRowClick={(expense) => router.push(`/expenses/${expense.id}`)}
              onEdit={setEditingExpense}
            />

            {!isLoading && data && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/60 px-6 py-4 text-sm text-gray-600">
                <ExpensePaginationSummary
                  page={data.page}
                  size={data.size}
                  itemCount={data.items.length}
                  totalItems={data.totalItems}
                />
                <div className={isFetching ? "opacity-60" : undefined} aria-busy={isFetching}>
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <ExpenseFormModal
        isOpen={isCreateOpen}
        categories={categories}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
      <ExpenseFormModal
        isOpen={Boolean(editingExpense)}
        categories={categories}
        expense={editingExpenseQuery.data ?? editingExpense}
        isLoadingDetail={editingExpenseQuery.isLoading}
        onClose={() => setEditingExpense(undefined)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
