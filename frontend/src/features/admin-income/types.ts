export interface AdminIncome {
  id: number;
  source: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  userEmail: string;
}

export interface AdminIncomeFilterRequest {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  userId?: number;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AdminIncomePageResponse {
  items: AdminIncome[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface IncomeRequest {
  source: string;
  amount: number;
  date: string;
  note?: string;
}
