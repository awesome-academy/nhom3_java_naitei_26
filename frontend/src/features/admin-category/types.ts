export interface CategoryAdminResponse {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  type: "EXPENSE" | "INCOME";
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAdminRequest {
  name: string;
  description?: string;
  icon?: string;
  type: "EXPENSE" | "INCOME";
}

export interface AdminCategoryFilters {
  search?: string;
  type?: "EXPENSE" | "INCOME" | "";
  page?: number;
  size?: number;
}
