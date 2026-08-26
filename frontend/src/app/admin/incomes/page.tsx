"use client";

import { useState } from "react";
import { AlertCircle, Edit2, RotateCcw, Search, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUsers } from "@/features/user/hooks";
import { useAdminIncomes, useAdminIncomeTotal } from "@/features/admin-income/hooks";
import type { AdminIncomeFilterRequest, AdminIncome } from "@/features/admin-income/types";
import { DeleteGlobalIncomeModal } from "@/features/admin-income/components/DeleteGlobalIncomeModal";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const PAGE_SIZE = 10;
const INITIAL_FILTERS: AdminIncomeFilterRequest = {
  search: "",
  userId: undefined,
  fromDate: "",
  toDate: "",
  minAmount: undefined,
  maxAmount: undefined,
};

export default function AdminIncomesPage() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("date,desc");
  const [filters, setFilters] = useState<AdminIncomeFilterRequest>(INITIAL_FILTERS);
  const [selectedIncome, setSelectedIncome] = useState<AdminIncome | null>(null);
  
  const debouncedSearch = useDebounce(filters.search, 300);
  const effectiveFilters = { ...filters, search: debouncedSearch, page, size: PAGE_SIZE, sort };
  
  const query = useAdminIncomes(effectiveFilters);
  const totalIncomeQuery = useAdminIncomeTotal();
  const usersQuery = useUsers({ page: 0, size: 100 }, false);
  const userOptions = Array.isArray(usersQuery.data?.content) ? usersQuery.data.content : [];

  const changeFilter = (field: keyof AdminIncomeFilterRequest, value: string | undefined) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSort("date,desc");
    setPage(0);
  };

  const data = query.data;
  const hasActiveFilter = !!(
    filters.search ||
    filters.userId ||
    filters.fromDate ||
    filters.toDate ||
    filters.minAmount ||
    filters.maxAmount ||
    sort !== "date,desc"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">FinTrack Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            System Income Records
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Audit, inspect, and moderate all user income and earning records across the platform
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs text-blue-800">
            <span className="block font-semibold">Total Records</span>
            <strong className="text-lg">{data?.totalItems ?? "-"}</strong>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs text-blue-800">
            <span className="block font-semibold">Total Incomes</span>
            <strong className="text-lg">{totalIncomeQuery.isLoading ? "-" : formatCurrency(totalIncomeQuery.data ?? 0)}</strong>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute bottom-3 left-3 z-10 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              aria-label="Search incomes"
              className="pl-9 w-full"
              placeholder="Search income title, source, or amount..."
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              aria-label="Filter by user"
              value={filters.userId?.toString() || ""}
              onChange={(event) => changeFilter("userId", event.target.value || undefined)}
              options={[
                { label: "All Users", value: "" },
                ...userOptions.map((user) => ({
                  label: `${user.name} (${user.email})`,
                  value: String(user.id),
                })),
              ]}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
                type="date"
                value={filters.fromDate}
                onChange={(event) => changeFilter("fromDate", event.target.value)}
              />
          </div>
          <div className="w-full md:w-auto">
             <Button variant="ghost" className="h-full w-full justify-center" onClick={resetFilters}>
                Reset
             </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {query.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" aria-hidden="true" />
            <p className="font-medium text-gray-900">Failed to load system incomes</p>
            <p className="text-sm text-gray-500">Please check your connection and try again.</p>
            <Button variant="outline" onClick={() => query.refetch()}>Retry</Button>
          </div>
        ) : query.isLoading ? (
          <div className="animate-pulse space-y-3 p-6" aria-label="Loading incomes">
            <div className="h-10 rounded bg-gray-200" />
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 rounded bg-gray-100" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-[#E2E8F0] bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">USER / ACCOUNT</th>
                    <th scope="col" className="px-4 py-3.5">INCOME SOURCE / TITLE</th>
                    <th scope="col" className="px-4 py-3.5">TYPE</th>
                    <th scope="col" className="px-4 py-3.5 text-right">AMOUNT</th>
                    <th scope="col" className="px-4 py-3.5">DATE</th>
                    <th scope="col" className="px-4 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(data?.items ?? []).length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                      {hasActiveFilter ? "No incomes match your filters" : "No system incomes found"}
                    </td></tr>
                  ) : data?.items.map((income) => (
                    <tr key={income.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {income.userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{income.userName}</p>
                            <p className="truncate text-xs text-gray-500">USR-{income.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{income.source}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Salary
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">+{formatCurrency(income.amount)}</td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-600">{formatDate(income.date)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2 text-gray-400">
                          <Link href={`${ROUTES.ADMIN_INCOMES}/edit/${income.id}`} className="hover:text-gray-900 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setSelectedIncome(income)} className="hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] bg-slate-50/40 px-6 py-4 text-sm text-gray-600">
                <span>
                  Showing <strong>{data.totalItems === 0 ? 0 : data.page * data.size + 1} to {Math.min((data.page + 1) * data.size, data.totalItems)}</strong> of <strong>{data.totalItems}</strong> global system income records
                </span>
                <div className={query.isFetching ? "opacity-60" : undefined} aria-busy={query.isFetching}>
                  <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedIncome && (
        <DeleteGlobalIncomeModal
          isOpen={true}
          onClose={() => setSelectedIncome(null)}
          income={selectedIncome}
        />
      )}
    </div>
  );
}
