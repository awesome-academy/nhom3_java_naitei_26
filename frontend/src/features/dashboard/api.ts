import apiClient from "@/lib/axios";
import type { DashboardSummary, CategorySpending } from "./types";

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>("/dashboard/summary"),
  getExpenseByCategory: () => apiClient.get<CategorySpending[]>("/dashboard/expense-by-category"),
};
