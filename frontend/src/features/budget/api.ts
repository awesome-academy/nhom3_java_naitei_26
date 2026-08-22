import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Budget, BudgetRequest } from "./types";

export const budgetApi = {
  getBudgets: (year?: number, month?: number) =>
    apiClient.get<ApiResponse<Budget[]>>("/budgets", {
      params: { year, month },
    }),

  getBudgetById: (id: number) =>
    apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`),

  getBudgetAlerts: () =>
    apiClient.get<ApiResponse<Budget[]>>("/budgets/alerts"),

  createBudget: (data: BudgetRequest) =>
    apiClient.post<ApiResponse<Budget>>("/budgets", data),

  updateBudget: (id: number, data: BudgetRequest) =>
    apiClient.put<ApiResponse<Budget>>(`/budgets/${id}`, data),

  deleteBudget: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/budgets/${id}`),
};
