import apiClient from "@/lib/axios";
import type { AdminExpenseFilters, AdminExpensePage } from "./types";

const BASE = "/admin/expenses";

export const adminExpenseApi = {
  getAll: (params: AdminExpenseFilters) =>
    apiClient.get<AdminExpensePage>(BASE, { params }),
};
