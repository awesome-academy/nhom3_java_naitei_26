import type { ExpenseFilter, ExpenseFilterValues } from "./types";

export interface ExpenseFilterErrors {
  date?: string;
  amount?: string;
}

export function validateExpenseFilters(values: ExpenseFilterValues): ExpenseFilterErrors {
  const errors: ExpenseFilterErrors = {};
  if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
    errors.date = "Ngày bắt đầu không được sau ngày kết thúc";
  }

  const minAmount = parseOptionalAmount(values.minAmount);
  const maxAmount = parseOptionalAmount(values.maxAmount);
  if (minAmount !== undefined && minAmount < 0) {
    errors.amount = "Số tiền tối thiểu không được âm";
  } else if (maxAmount !== undefined && maxAmount < 0) {
    errors.amount = "Số tiền tối đa không được âm";
  } else if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    errors.amount = "Số tiền tối thiểu không được lớn hơn số tiền tối đa";
  }
  return errors;
}

export function toExpenseFilter(values: ExpenseFilterValues): ExpenseFilter {
  return {
    search: values.search.trim() || undefined,
    categoryId: values.categoryId ? Number(values.categoryId) : undefined,
    fromDate: values.fromDate || undefined,
    toDate: values.toDate || undefined,
    minAmount: parseOptionalAmount(values.minAmount),
    maxAmount: parseOptionalAmount(values.maxAmount),
  };
}

function parseOptionalAmount(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}
