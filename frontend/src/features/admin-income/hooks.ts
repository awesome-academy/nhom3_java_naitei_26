import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminIncome,
  getAdminIncome,
  getAdminIncomes,
  updateAdminIncome,
  getAdminIncomeTotal,
} from "./api";
import { AdminIncomeFilterRequest } from "./types";
import { toast } from "sonner";

export const adminIncomeKeys = {
  all: ["admin-incomes"] as const,
  lists: () => [...adminIncomeKeys.all, "list"] as const,
  list: (filters: AdminIncomeFilterRequest) =>
    [...adminIncomeKeys.lists(), filters] as const,
  details: () => [...adminIncomeKeys.all, "detail"] as const,
  detail: (id: number) => [...adminIncomeKeys.details(), id] as const,
  totals: () => [...adminIncomeKeys.all, "total"] as const,
  total: (filters?: AdminIncomeFilterRequest) => [...adminIncomeKeys.totals(), filters] as const,
};

export const useAdminIncomes = (filters: AdminIncomeFilterRequest) => {
  return useQuery({
    queryKey: adminIncomeKeys.list(filters),
    queryFn: () => getAdminIncomes(filters),
  });
};

export const useAdminIncome = (id: number) => {
  return useQuery({
    queryKey: adminIncomeKeys.detail(id),
    queryFn: () => getAdminIncome(id),
    enabled: !!id,
  });
};

export const useUpdateAdminIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminIncome,
    onSuccess: (data) => {
      toast.success("Income record updated successfully");
      queryClient.invalidateQueries({ queryKey: adminIncomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminIncomeKeys.totals() });
      queryClient.invalidateQueries({
        queryKey: adminIncomeKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update income record"
      );
    },
  });
};

export const useDeleteAdminIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminIncome,
    onSuccess: () => {
      toast.success("Income record deleted successfully");
      queryClient.invalidateQueries({ queryKey: adminIncomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminIncomeKeys.totals() });
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete income record"
      );
    },
  });
};

export const useAdminIncomeTotal = (filters?: AdminIncomeFilterRequest) => {
  return useQuery({
    queryKey: adminIncomeKeys.total(filters),
    queryFn: () => getAdminIncomeTotal(filters),
  });
};
