/**
 * Feature: Expense
 * Custom hooks — dùng React Query để quản lý server-state,
 * tự động cache, refetch, và đồng bộ UI.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "./api";
import { expenseCategoryApi } from "./categoryApi";
import type { ExpenseFilter, ExpenseMutationInput } from "./types";

const QUERY_KEY = "expenses";

export function useExpenses(filter?: ExpenseFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => expenseApi.getAll(filter).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: [QUERY_KEY, "categories"],
    queryFn: () => expenseCategoryApi.getExpenseCategories().then((res) => res.data),
    retry: false,
  });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => expenseApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseMutationInput) => expenseApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ExpenseMutationInput }) =>
      expenseApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useDeleteExpenseAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, attachmentId }: { expenseId: number; attachmentId: number }) =>
      expenseApi.deleteAttachment(expenseId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.expenseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
