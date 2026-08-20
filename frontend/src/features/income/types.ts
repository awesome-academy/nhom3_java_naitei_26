/**
 * Feature: Income
 * Type definitions cho Income domain.
 */

/**
 * Income classification types — theo design spec U08.
 * Dùng cho badge hiển thị và filter dropdown.
 */
export type IncomeType = "Salary" | "Freelance" | "Investment" | "Rental" | "Bonus";

/**
 * Mapping màu cho từng IncomeType — dùng cho badge và icon background.
 * Tách riêng để dễ mở rộng khi thêm type mới.
 */
export const INCOME_TYPE_STYLES: Record<
  IncomeType,
  { bg: string; text: string; iconBg: string; iconText: string }
> = {
  Salary: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  Freelance: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  Investment: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
  },
  Rental: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
  },
  Bonus: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
};

/**
 * Icon name (Lucide) cho từng IncomeType.
 */
export const INCOME_TYPE_ICONS: Record<IncomeType, string> = {
  Salary: "Landmark",
  Freelance: "Monitor",
  Investment: "TrendingUp",
  Rental: "Home",
  Bonus: "Gift",
};

export interface Income {
  id: string;
  source: string;
  note: string;
  type: IncomeType;
  amount: number;
  date: string;
  /** Legacy fields — backward compatible */
  description: string;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeDto {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  source?: string;
  type?: IncomeType;
  note?: string;
}

export interface UpdateIncomeDto extends Partial<CreateIncomeDto> {}
