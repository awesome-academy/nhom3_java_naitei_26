export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  totalAmount: number;
  percentage: number;
}
