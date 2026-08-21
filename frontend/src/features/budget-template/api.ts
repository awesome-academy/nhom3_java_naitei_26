import apiClient from "@/lib/axios";
import type {
  BudgetTemplate,
  CreateBudgetTemplateDto,
  UpdateBudgetTemplateDto,
} from "./types";

const BASE = "/admin/budget-templates";

export const budgetTemplateApi = {
  getAll: () => apiClient.get<BudgetTemplate[]>(BASE),

  getById: (id: string) =>
    apiClient.get<BudgetTemplate>(`${BASE}/${id}`),

  create: (data: CreateBudgetTemplateDto) =>
    apiClient.post<BudgetTemplate>(BASE, data),

  update: (id: string, data: UpdateBudgetTemplateDto) =>
    apiClient.put<BudgetTemplate>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
