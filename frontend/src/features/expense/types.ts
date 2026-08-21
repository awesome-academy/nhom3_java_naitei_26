/**
 * Feature: Expense
 * Type definitions cho Expense domain.
 */

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  note?: string | null;
  categoryId: number;
  categoryName: string;
  createdAt?: string;
  updatedAt?: string | null;
  attachments?: ExpenseAttachment[];
}

export interface ExpenseAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
}

export interface CreateExpenseDto {
  title: string;
  amount: number;
  categoryId: number;
  date: string;
  note?: string;
}

export type UpdateExpenseDto = CreateExpenseDto;

export interface ExpenseMutationInput {
  data: CreateExpenseDto;
  files: File[];
}

export interface ExpenseFilter {
  categoryId?: number;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ExpensePageResponse {
  items: Expense[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ExpenseCategoryOption {
  id: number;
  name: string;
}

export interface ExpenseFilterValues {
  search: string;
  categoryId: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
}
