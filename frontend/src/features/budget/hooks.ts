import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "./api";
import type { BudgetRequest } from "./types";

export function useBudgets(year?: number, month?: number) {
  return useQuery({
    queryKey: ["budgets", { year, month }],
    queryFn: async () => {
      const res = await budgetApi.getBudgets(year, month);
      return res.data;
    },
  });
}

export function useBudgetAlerts() {
  return useQuery({
    queryKey: ["budgets", "alerts"],
    queryFn: async () => {
      const res = await budgetApi.getBudgetAlerts();
      return res.data;
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetRequest) => budgetApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetRequest }) =>
      budgetApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
