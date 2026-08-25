import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomeApi } from "./api";
import type { CreateIncomeDto, UpdateIncomeDto } from "./types";

const QUERY_KEY = "incomes";

export function useIncomes(filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => incomeApi.getAll(filter).then((res) => res.data),
  });
}

export function useIncome(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => incomeApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeDto) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeDto }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}
