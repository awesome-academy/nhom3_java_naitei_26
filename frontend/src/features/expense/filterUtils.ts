import type { ExpenseFilter, ExpenseFilterValues } from "./types";

export interface ExpenseFilterErrors {
  date?: string;
  amount?: string;
}

export function validateExpenseFilters(values: ExpenseFilterValues): ExpenseFilterErrors {
  const errors: ExpenseFilterErrors = {};
  if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
    errors.date = "The start date cannot be after the end date";
  }

  const minAmount = parseOptionalAmount(values.minAmount);
  const maxAmount = parseOptionalAmount(values.maxAmount);
  if (minAmount !== undefined && minAmount < 0) {
    errors.amount = "The minimum amount cannot be negative";
  } else if (maxAmount !== undefined && maxAmount < 0) {
    errors.amount = "The maximum amount cannot be negative";
  } else if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    errors.amount = "The minimum amount cannot exceed the maximum amount";
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
