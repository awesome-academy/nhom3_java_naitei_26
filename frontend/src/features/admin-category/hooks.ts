import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCategoryApi } from "./api";
import { AdminCategoryFilters, CategoryAdminRequest } from "./types";
import { toast } from "sonner";

export const useAdminCategories = (filters: AdminCategoryFilters) => {
  return useQuery({
    queryKey: ["admin-categories", filters],
    queryFn: () => adminCategoryApi.getAll(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });
};

export const useAdminCategory = (id: number) => {
  return useQuery({
    queryKey: ["admin-categories", id],
    queryFn: () => adminCategoryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryAdminRequest) => adminCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Global category created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryAdminRequest }) =>
      adminCategoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Global category updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminCategoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Global category deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
};
