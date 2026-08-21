/**
 * Feature: Expense
 * API calls — tách riêng để mỗi domain tự quản lý endpoints của mình,
 * tránh 1 file api.ts khổng lồ gây conflict khi nhiều người code song song.
 */
import apiClient from "@/lib/axios";
import type {
  CreateExpenseDto,
  Expense,
  ExpenseFilter,
  ExpensePageResponse,
  UpdateExpenseDto,
  ExpenseMutationInput,
} from "./types";

const BASE = "/expenses";

export const expenseApi = {
  getAll: (params?: ExpenseFilter) => apiClient.get<ExpensePageResponse>(BASE, { params }),

  getById: (id: number) => apiClient.get<Expense>(`${BASE}/${id}`),

  create: ({ data, files }: ExpenseMutationInput) =>
    files.length
      ? apiClient.post<Expense>(BASE, createFormData(data, files), multipartConfig)
      : apiClient.post<Expense>(BASE, data),

  update: (id: number, { data, files }: ExpenseMutationInput) =>
    files.length
      ? apiClient.put<Expense>(`${BASE}/${id}`, createFormData(data, files), multipartConfig)
      : apiClient.put<Expense>(`${BASE}/${id}`, data),

  downloadAttachment: (expenseId: number, attachmentId: number) =>
    apiClient.get<Blob>(`${BASE}/${expenseId}/attachments/${attachmentId}/download`, {
      responseType: "blob",
    }),

  deleteAttachment: (expenseId: number, attachmentId: number) =>
    apiClient.delete(`${BASE}/${expenseId}/attachments/${attachmentId}`),

  delete: (id: number) => apiClient.delete(`${BASE}/${id}`),
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

function createFormData(data: CreateExpenseDto | UpdateExpenseDto, files: File[]): FormData {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  files.forEach((file) => formData.append("files", file));
  return formData;
}
