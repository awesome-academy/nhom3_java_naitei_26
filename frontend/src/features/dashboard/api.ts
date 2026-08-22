import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DashboardSummary, CategorySpending } from "./types";

export const dashboardApi = {
  getSummary: () => apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary"),
  getExpenseByCategory: () => apiClient.get<ApiResponse<CategorySpending[]>>("/dashboard/expense-by-category"),
};
