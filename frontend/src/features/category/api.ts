import apiClient from "@/lib/axios";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "./types";

const BASE = "/categories";

export const categoryApi = {
  /**
   * GET /api/categories — Lấy danh sách danh mục (chung + riêng).
   * Backend trả về List (không phân trang).
   */
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<Category[]>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Category>(`${BASE}/${id}`),

  /**
   * POST /api/categories — Tạo danh mục riêng.
   * BE tự gán userId từ token.
   */
  create: (data: CreateCategoryDto) =>
    apiClient.post<Category>(BASE, data),

  /**
   * PUT /api/categories/{id} — Sửa danh mục riêng.
   * 403 nếu là danh mục chung, 404 nếu không chính chủ, 409 nếu đổi type đang có dữ liệu.
   */
  update: (id: string, data: UpdateCategoryDto) =>
    apiClient.put<Category>(`${BASE}/${id}`, data),

  /**
   * DELETE /api/categories/{id} — Xoá danh mục riêng.
   * 403 nếu là danh mục chung, 409 nếu đang có dữ liệu.
   */
  delete: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
};
