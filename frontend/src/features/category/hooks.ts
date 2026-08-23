import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "./api";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "./types";

const QUERY_KEY = "categories";

/**
 * Hook lấy danh sách danh mục (chung + riêng của user hiện tại).
 * Có thể lọc theo type: { type: "EXPENSE" } hoặc { type: "INCOME" }.
 */
export function useCategories(filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => categoryApi.getAll(filter).then((res) => res.data as Category[]),
  });
}

/**
 * Hook tạo danh mục riêng mới.
 * Khi thành công, invalidate cache để cập nhật danh sách.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

/**
 * Hook cập nhật danh mục riêng.
 * Errors: 403 (danh mục chung), 404 (không chính chủ), 409 (đổi type đang có dữ liệu).
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

/**
 * Hook xoá danh mục riêng.
 * Errors: 403 (danh mục chung), 409 (đang có dữ liệu).
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
