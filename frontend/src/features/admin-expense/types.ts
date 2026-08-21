export interface AdminExpense {
  id: number;
  title: string;
  amount: number;
  date: string;
  note?: string | null;
  categoryId: number;
  categoryName: string;
  createdAt?: string;
  updatedAt?: string | null;
  userId: number;
  userName: string;
  userEmail: string;
}

export interface AdminExpensePage {
  items: AdminExpense[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminExpenseFilters {
  page: number;
  size: number;
  sort: string;
  search?: string;
  userId?: number;
  categoryId?: number;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AdminExpenseFilterValues {
  search: string;
  userId: string;
  categoryId: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
}
