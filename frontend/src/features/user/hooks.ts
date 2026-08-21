import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./api";
import type { CreateUserDto, UpdateUserDto } from "./types";

const QUERY_KEY = "users";

export function useUsers(filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => userApi.getAll(filter).then((res) => res.data),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => userApi.getById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
