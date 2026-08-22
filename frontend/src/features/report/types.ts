export type ReportPeriod = "month" | "quarter" | "year";

export interface ReportPeriodParams {
  period: ReportPeriod;
  value: string;
}

export interface ReportDateRange {
  from: string;
  to: string;
}

export interface ReportCategory {
  categoryId: number;
  name: string;
  amount: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  byCategory: ReportCategory[];
}

export interface ReportComparison {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface ReportTrendPoint {
  period: string;
  income: number;
  expense: number;
}