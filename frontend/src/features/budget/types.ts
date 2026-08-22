export interface Budget {
  id: number;
  userId: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  month: number;
  year: number;
  actualSpending: number;
  spendingPercentage: number;
  alertStatus: "NORMAL" | "WARNING" | "EXCEEDED";
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  categoryId: number;
  amount: number;
  month: number;
  year: number;
}
