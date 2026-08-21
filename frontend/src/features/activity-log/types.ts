export interface ActivityLog {
  [key: string]: unknown;
  id: string;
  createdAt: string;
  userId: string | null;
  actorName: string;
  actorEmail: string;
  action: string;
  description: string | null;
}

export interface ActivityLogFilter {
  page?: number;
  size?: number;
  userId?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ActivityLogPageResponse {
  items: ActivityLog[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
