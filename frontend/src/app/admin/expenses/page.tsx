"use client";

import { useState } from "react";
import { AlertCircle, RotateCcw, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUsers } from "@/features/user/hooks";
import { useExpenseCategories } from "@/features/expense/hooks";
import { useAdminExpenseTotal, useAdminExpenses } from "@/features/admin-expense/hooks";
import {
  toAdminExpenseFilters,
  validateAdminExpenseFilters,
} from "@/features/admin-expense/filterUtils";
import type { AdminExpenseFilterValues } from "@/features/admin-expense/types";

const PAGE_SIZE = 10;
const INITIAL_FILTERS: AdminExpenseFilterValues = {
  search: "",
  userId: "",
  categoryId: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

export default function AdminExpensesPage() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("date,desc");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 300);
  const effectiveFilters = { ...filters, search: debouncedSearch };
  const errors = validateAdminExpenseFilters(effectiveFilters);
  const isValid = Object.keys(errors).length === 0;
  const query = useAdminExpenses(
    toAdminExpenseFilters(effectiveFilters, page, sort, PAGE_SIZE),
    isValid
  );
  const totalExpenseQuery = useAdminExpenseTotal();
  const categoriesQuery = useExpenseCategories();
  const usersQuery = useUsers({ page: 0, size: 100 }, false);
  const categoryOptions = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const userOptions = Array.isArray(usersQuery.data?.content) ? usersQuery.data.content : [];

  const changeFilter = (field: keyof AdminExpenseFilterValues, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSort("date,desc");
    setPage(0);
  };

  const data = query.data;
  const hasActiveFilter = Object.values(filters).some(Boolean) || sort !== "date,desc";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">FinTrack Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            System Expense Records
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and filter all user expense records across the system
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs text-blue-800">
            <span className="block font-semibold">Total Transactions</span>
            <strong className="text-lg">{data?.totalItems ?? "-"}</strong>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs text-blue-800">
            <span className="block font-semibold">Total Expenses</span>
            <strong className="text-lg">{totalExpenseQuery.isLoading ? "-" : formatCurrency(totalExpenseQuery.data ?? 0)}</strong>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute bottom-3 left-3 z-10 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              label="Search"
              aria-label="Search by expense name"
              className="pl-9"
              placeholder="Search expense title..."
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
            />
          </div>
          <Select
            label="User / Account"
            aria-label="Filter by user"
            value={filters.userId}
            onChange={(event) => changeFilter("userId", event.target.value)}
            options={[
              { label: "All Users", value: "" },
              ...userOptions.map((user) => ({
                label: `${user.name} (${user.email})`,
                value: user.id,
              })),
            ]}
          />
          <Select
            label="Category"
            aria-label="Filter by category"
            value={filters.categoryId}
            onChange={(event) => changeFilter("categoryId", event.target.value)}
            options={[
              { label: "All Categories", value: "" },
              ...categoryOptions.map((category) => ({
                label: category.name,
                value: String(category.id),
              })),
            ]}
          />
          <Select
            label="Sort"
            aria-label="Sort expenses"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(0);
            }}
            options={[
              { label: "Newest date", value: "date,desc" },
              { label: "Oldest date", value: "date,asc" },
              { label: "Amount ascending", value: "amount,asc" },
              { label: "Amount descending", value: "amount,desc" },
              { label: "Name A-Z", value: "title,asc" },
              { label: "Name Z-A", value: "title,desc" },
            ]}
          />
          <Input
            label="From Date"
            type="date"
            value={filters.fromDate}
            onChange={(event) => changeFilter("fromDate", event.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={filters.toDate}
            onChange={(event) => changeFilter("toDate", event.target.value)}
          />
          <Input
            label="Min Amount"
            type="number"
            min="0"
            value={filters.minAmount}
            onChange={(event) => changeFilter("minAmount", event.target.value)}
          />
          <Input
            label="Max Amount"
            type="number"
            min="0"
            value={filters.maxAmount}
            onChange={(event) => changeFilter("maxAmount", event.target.value)}
          />
        </div>
        {(errors.date || errors.amount) && (
          <div className="mt-3 space-y-1 text-sm text-red-600">
            {errors.date && <p>{errors.date}</p>}
            {errors.amount && <p>{errors.amount}</p>}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {query.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" aria-hidden="true" />
            <p className="font-medium text-gray-900">Unable to load expense records</p>
            <p className="text-sm text-gray-500">Check your connection and try again.</p>
            <Button variant="outline" onClick={() => query.refetch()}>Try again</Button>
          </div>
        ) : query.isLoading ? (
          <div className="animate-pulse space-y-3 p-6" aria-label="Loading expense records">
            <div className="h-10 rounded bg-gray-200" />
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 rounded bg-gray-100" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-[#E2E8F0] bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">User / Account</th>
                    <th scope="col" className="px-4 py-3.5">Expense Title</th>
                    <th scope="col" className="px-4 py-3.5">Category</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Amount</th>
                    <th scope="col" className="px-4 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(data?.items ?? []).length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                      {hasActiveFilter ? "No matching expense records found" : "No expense records found"}
                    </td></tr>
                  ) : data?.items.map((expense) => (
                    <tr key={expense.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-bold text-blue-700">
                            {expense.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{expense.userName}</p>
                            <p className="truncate text-xs text-gray-500">{expense.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{expense.title}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{expense.categoryName}</span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-600">{formatDate(expense.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] bg-slate-50/40 px-6 py-4 text-sm text-gray-600">
                <span>
                  Showing <strong>{data.totalItems === 0 ? 0 : data.page * data.size + 1}–{data.page * data.size + data.items.length}</strong> of <strong>{data.totalItems}</strong> expense records
                </span>
                <div className={query.isFetching ? "opacity-60" : undefined} aria-busy={query.isFetching}>
                  <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
