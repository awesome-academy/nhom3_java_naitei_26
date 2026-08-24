export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFilterRequest {
  page?: number;
  size?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
}

export interface AdminUserPageResponse {
  items: AdminUser[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}
