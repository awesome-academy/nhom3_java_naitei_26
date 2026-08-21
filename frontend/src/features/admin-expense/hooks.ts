import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminExpenseApi } from "./api";
import type { AdminExpenseFilters } from "./types";

export function useAdminExpenses(filters: AdminExpenseFilters, enabled = true) {
  return useQuery({
    queryKey: ["admin-expenses", filters],
    queryFn: () => adminExpenseApi.getAll(filters).then((response) => response.data),
    placeholderData: keepPreviousData,
    enabled,
  });
}
