import apiClient from "@/lib/axios";
import type {
  ReportComparison,
  ReportDateRange,
  ReportPeriodParams,
  ReportSummary,
  ReportTrendPoint,
} from "./types";

const BASE = "/reports";

export const reportApi = {
  getSummary: (params: ReportPeriodParams) =>
    apiClient.get<ReportSummary>(`${BASE}/summary`, { params }),

  getComparison: (params: ReportPeriodParams) =>
    apiClient.get<ReportComparison>(`${BASE}/comparison`, { params }),

  getTrend: (params: ReportDateRange) =>
    apiClient.get<ReportTrendPoint[]>(`${BASE}/trend`, { params }),
};