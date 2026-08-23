import axiosClient from "@/lib/axios";
import { CategoryAdminResponse, CategoryAdminRequest, AdminCategoryFilters } from "./types";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminCategoryApi = {
  getAll: async (filters: AdminCategoryFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.page !== undefined) params.append("page", filters.page.toString());
    if (filters.size !== undefined) params.append("size", filters.size.toString());

    const response = await axiosClient.get<PageResponse<CategoryAdminResponse>>(
      "/admin/categories",
      { params }
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosClient.get<CategoryAdminResponse>(`/admin/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryAdminRequest) => {
    const response = await axiosClient.post<CategoryAdminResponse>("/admin/categories", data);
    return response.data;
  },

  update: async (id: number, data: CategoryAdminRequest) => {
    const response = await axiosClient.put<CategoryAdminResponse>(`/admin/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/admin/categories/${id}`);
  },
};
