import apiClient from "@/lib/axios";
import type { ActivityLogFilter, ActivityLogPageResponse } from "./types";

const BASE = "/admin/activity-logs";

export const activityLogApi = {
  getAll: (filter?: ActivityLogFilter) =>
    apiClient.get<ActivityLogPageResponse>(BASE, { params: filter }),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
