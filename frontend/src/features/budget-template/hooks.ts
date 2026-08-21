import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetTemplateApi } from "./api";
import type {
  CreateBudgetTemplateDto,
  UpdateBudgetTemplateDto,
} from "./types";

const QUERY_KEY = "budget-templates";

export function useBudgetTemplates() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => budgetTemplateApi.getAll().then((res) => res.data),
  });
}

export function useBudgetTemplate(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => budgetTemplateApi.getById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useCreateBudgetTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetTemplateDto) =>
      budgetTemplateApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBudgetTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetTemplateDto }) =>
      budgetTemplateApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteBudgetTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetTemplateApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}
