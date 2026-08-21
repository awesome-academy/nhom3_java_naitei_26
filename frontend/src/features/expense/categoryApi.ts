import apiClient from "@/lib/axios";
import type { ExpenseCategoryOption } from "./types";

const CATEGORY_PATH = "/categories";

export const expenseCategoryApi = {
  getExpenseCategories: () =>
    apiClient.get<ExpenseCategoryOption[]>(CATEGORY_PATH, {
      params: { type: "EXPENSE" },
    }),
};
