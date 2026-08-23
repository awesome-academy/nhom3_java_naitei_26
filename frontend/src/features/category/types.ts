export type CategoryType = "EXPENSE" | "INCOME";

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  scope: "COMMON" | "PRIVATE"; // Trả về từ backend thay vì isSystem
  transactionCount?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  id: string;
}

/**
 * Mapping style cho Category Type (Expense / Income)
 */
export const CATEGORY_TYPE_STYLES: Record<
  CategoryType,
  { bg: string; text: string; iconBg: string; iconText: string }
> = {
  EXPENSE: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  INCOME: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
};
