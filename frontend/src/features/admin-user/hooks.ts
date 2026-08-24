import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAdminUsers, updateAdminUserRole, updateAdminUserStatus } from "./api";
import type { AdminUserFilterRequest } from "./types";

export const adminUserKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  list: (filters: AdminUserFilterRequest) => [...adminUserKeys.lists(), filters] as const,
};

export const useAdminUsers = (filters: AdminUserFilterRequest) => {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => getAdminUsers(filters),
  });
};

export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUserRole,
    onSuccess: () => {
      toast.success("Cập nhật vai trò thành công");
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể cập nhật vai trò");
    },
  });
};

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUserStatus,
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    },
  });
};
