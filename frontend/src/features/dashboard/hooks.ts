import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const res = await dashboardApi.getSummary();
      return res.data;
    },
  });
}

export function useCategoryExpense() {
  return useQuery({
    queryKey: ["dashboard", "expense-by-category"],
    queryFn: async () => {
      const res = await dashboardApi.getExpenseByCategory();
      return res.data;
    },
  });
}
