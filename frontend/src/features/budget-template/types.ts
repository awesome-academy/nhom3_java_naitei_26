export interface BudgetTemplateDetail {
  id: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  amount: number;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  month: number;
  warningPercentage: number;
  details: BudgetTemplateDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTemplateDetailDto {
  categoryId: string;
  amount: number;
}

export interface CreateBudgetTemplateDto {
  name: string;
  month: number;
  warningPercentage: number;
  details: BudgetTemplateDetailDto[];
}

export interface UpdateBudgetTemplateDto {
  name: string;
  month: number;
  warningPercentage: number;
  details: BudgetTemplateDetailDto[];
}
