import apiClient from "@/lib/axios";
import type {
  AdminUser,
  AdminUserFilterRequest,
  AdminUserPageResponse,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
} from "./types";

const BASE = "/admin/users";

export const getAdminUsers = async (
  params: AdminUserFilterRequest
): Promise<AdminUserPageResponse> => {
  const { data } = await apiClient.get<AdminUserPageResponse>(BASE, { params });
  return data;
};

export const updateAdminUserRole = async ({
  id,
  role,
}: { id: number } & UpdateUserRoleRequest): Promise<AdminUser> => {
  const { data } = await apiClient.put<AdminUser>(`${BASE}/${id}/role`, { role });
  return data;
};

export const updateAdminUserStatus = async ({
  id,
  status,
}: { id: number } & UpdateUserStatusRequest): Promise<AdminUser> => {
  const { data } = await apiClient.put<AdminUser>(`${BASE}/${id}/status`, { status });
  return data;
};
