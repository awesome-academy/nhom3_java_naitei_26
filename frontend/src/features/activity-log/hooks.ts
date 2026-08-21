import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityLogApi } from "./api";
import type { ActivityLogFilter } from "./types";

const QUERY_KEY = "activity-logs";

export function useActivityLogs(filter: ActivityLogFilter) {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => activityLogApi.getAll(filter).then((res) => res.data),
  });
}

export function useDeleteActivityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activityLogApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
