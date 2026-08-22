import { useQuery } from "@tanstack/react-query";
import { reportApi } from "./api";
import type { ReportDateRange, ReportPeriodParams } from "./types";

export function useReportSummary(params: ReportPeriodParams) {
  return useQuery({
    queryKey: ["report-summary", params],
    queryFn: () => reportApi.getSummary(params).then((response) => response.data),
  });
}

export function useReportComparison(params: ReportPeriodParams) {
  return useQuery({
    queryKey: ["report-comparison", params],
    queryFn: () => reportApi.getComparison(params).then((response) => response.data),
  });
}

export function useReportTrend(params: ReportDateRange) {
  return useQuery({
    queryKey: ["report-trend", params],
    queryFn: () => reportApi.getTrend(params).then((response) => response.data),
  });
}