"use client";

import { useState } from "react";
import { AlertCircle, Ban, CheckCircle2, RotateCcw, Search, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  useAdminUsers,
  useUpdateAdminUserRole,
  useUpdateAdminUserStatus,
} from "@/features/admin-user/hooks";
import type { AdminUser, UserRole, UserStatus } from "@/features/admin-user/types";

const PAGE_SIZE = 10;

interface Filters {
  search: string;
  status: UserStatus | "";
  role: UserRole | "";
}

const INITIAL_FILTERS: Filters = { search: "", status: "", role: "" };

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 300);

  const currentUser = useAuthStore((state) => state.user);

  const query = useAdminUsers({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    role: filters.role || undefined,
  });
  const updateRole = useUpdateAdminUserRole();
  const updateStatus = useUpdateAdminUserStatus();

  const changeFilter = <K extends keyof Filters>(field: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const handleRoleChange = (user: AdminUser, role: UserRole) => {
    if (role === user.role) return;
    const confirmed = window.confirm(
      `Change "${user.name}"'s role to ${role === "ADMIN" ? "Admin" : "User"}?`
    );
    if (!confirmed) return;
    updateRole.mutate({ id: user.id, role });
  };

  const handleStatusToggle = (user: AdminUser) => {
    const nextStatus: UserStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (nextStatus === "INACTIVE") {
      const confirmed = window.confirm(`Deactivate "${user.name}"'s account?`);
      if (!confirmed) return;
    }
    updateStatus.mutate({ id: user.id, status: nextStatus });
  };

  const data = query.data;
  const hasActiveFilter = Object.values(filters).some(Boolean);
  const isMutating = updateRole.isPending || updateStatus.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">FinTrack Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the user list, change roles, and activate/deactivate accounts
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right text-xs text-blue-800">
          <span className="block font-semibold">Total Users</span>
          <strong className="text-lg">{data?.totalItems ?? "-"}</strong>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute bottom-3 left-3 z-10 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              label="Search"
              aria-label="Search by name or email"
              className="pl-9"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
            />
          </div>
          <Select
            label="Status"
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => changeFilter("status", event.target.value as UserStatus | "")}
            options={[
              { label: "All statuses", value: "" },
              { label: "Active", value: "ACTIVE" },
              { label: "Deactivated", value: "INACTIVE" },
            ]}
          />
          <Select
            label="Role"
            aria-label="Filter by role"
            value={filters.role}
            onChange={(event) => changeFilter("role", event.target.value as UserRole | "")}
            options={[
              { label: "All roles", value: "" },
              { label: "Admin", value: "ADMIN" },
              { label: "User", value: "USER" },
            ]}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasActiveFilter}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {query.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-9 w-9 text-red-500" aria-hidden="true" />
            <p className="font-medium text-gray-900">Unable to load the user list</p>
            <p className="text-sm text-gray-500">Please check your connection and try again.</p>
            <Button variant="outline" onClick={() => query.refetch()}>Retry</Button>
          </div>
        ) : query.isLoading ? (
          <div className="animate-pulse space-y-3 p-6" aria-label="Loading user list">
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
                    <th scope="col" className="px-4 py-3.5">Role</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5">Created At</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(data?.items ?? []).length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                      {hasActiveFilter ? "No matching users found" : "No users yet"}
                    </td></tr>
                  ) : data?.items.map((user) => {
                    const isSelf = String(currentUser?.id) === String(user.id);
                    return (
                      <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-bold text-blue-700">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {user.name}
                                {isSelf && <span className="ml-1.5 text-xs font-normal text-gray-400">(you)</span>}
                              </p>
                              <p className="truncate text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            aria-label={`${user.name}'s role`}
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            value={user.role}
                            disabled={isMutating}
                            onChange={(event) => handleRoleChange(user, event.target.value as UserRole)}
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            {user.status === "ACTIVE" ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            title={isSelf ? "You cannot deactivate your own account" : undefined}
                            disabled={isMutating || isSelf}
                            onClick={() => handleStatusToggle(user)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              user.status === "ACTIVE"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <>
                                <Ban className="h-3.5 w-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] bg-slate-50/40 px-6 py-4 text-sm text-gray-600">
                <span>
                  Showing <strong>{data.totalItems === 0 ? 0 : data.page * data.size + 1}–{data.page * data.size + data.items.length}</strong> of <strong>{data.totalItems}</strong> users
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
