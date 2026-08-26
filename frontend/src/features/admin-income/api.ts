import axiosInstance from "@/lib/axios";
import {
  AdminIncome,
  AdminIncomeFilterRequest,
  AdminIncomePageResponse,
  IncomeRequest,
} from "./types";
import { ApiResponse } from "@/types/api";

export const getAdminIncomes = async (
  params: AdminIncomeFilterRequest
): Promise<AdminIncomePageResponse> => {
  const { data } = await axiosInstance.get<AdminIncomePageResponse>(
    "/admin/incomes",
    { params }
  );
  return data;
};

export const getAdminIncome = async (id: number): Promise<AdminIncome> => {
  const { data } = await axiosInstance.get<AdminIncome>(
    `/admin/incomes/${id}`
  );
  return data;
};

export const updateAdminIncome = async ({
  id,
  data,
}: {
  id: number;
  data: IncomeRequest;
}): Promise<AdminIncome> => {
  const response = await axiosInstance.put<AdminIncome>(
    `/admin/incomes/${id}`,
    data
  );
  return response.data;
};

export const deleteAdminIncome = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/incomes/${id}`);
};

export const getAdminIncomeTotal = async (
  params?: AdminIncomeFilterRequest
): Promise<number> => {
  const { data } = await axiosInstance.get<number>("/admin/incomes/total", {
    params,
  });
  return data;
};
