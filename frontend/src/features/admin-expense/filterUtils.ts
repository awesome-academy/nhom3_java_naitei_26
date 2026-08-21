import type { AdminExpenseFilterValues, AdminExpenseFilters } from "./types";

export interface AdminExpenseFilterErrors {
  date?: string;
  amount?: string;
}

export function validateAdminExpenseFilters(values: AdminExpenseFilterValues): AdminExpenseFilterErrors {
  const errors: AdminExpenseFilterErrors = {};
  if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
    errors.date = "Ngày bắt đầu không được sau ngày kết thúc";
  }

  const minAmount = parseAmount(values.minAmount);
  const maxAmount = parseAmount(values.maxAmount);
  if (minAmount !== undefined && minAmount < 0) {
    errors.amount = "Số tiền tối thiểu không được âm";
  } else if (maxAmount !== undefined && maxAmount < 0) {
    errors.amount = "Số tiền tối đa không được âm";
  } else if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    errors.amount = "Số tiền tối thiểu không được lớn hơn số tiền tối đa";
  }
  return errors;
}

export function toAdminExpenseFilters(
  values: AdminExpenseFilterValues,
  page: number,
  sort: string,
  size: number
): AdminExpenseFilters {
  return {
    page,
    size,
    sort,
    search: values.search.trim() || undefined,
    userId: values.userId ? Number(values.userId) : undefined,
    categoryId: values.categoryId ? Number(values.categoryId) : undefined,
    fromDate: values.fromDate || undefined,
    toDate: values.toDate || undefined,
    minAmount: parseAmount(values.minAmount),
    maxAmount: parseAmount(values.maxAmount),
  };
}

function parseAmount(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}
