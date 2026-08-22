"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { IncomeForm } from "@/features/income/components";
import { useUpdateIncome } from "@/features/income/hooks";
import { incomeApi } from "@/features/income/api";
import type { Income, UpdateIncomeDto } from "@/features/income/types";
import { ROUTES } from "@/lib/constants";

/**
 * EditIncomePage — Trang chỉnh sửa khoản thu nhập.
 *
 * Flow:
 * - Load dữ liệu thu nhập hiện tại qua GET /api/incomes/{id}
 * - Pre-fill vào IncomeForm
 * - Submit PUT /api/incomes/{id}
 * - Xử lý lỗi: 400 (validation), 404 (not found / not owned)
 * - Thành công → điều hướng về danh sách /incomes
 */
export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const incomeId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIncome, setIsLoadingIncome] = useState(true);
  const [income, setIncome] = useState<Income | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const updateMutation = useUpdateIncome();

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const res = await incomeApi.getById(incomeId);
        setIncome(res.data as Income);
      } catch (error: any) {
        if (error?.status === 404) {
          setGeneralError("Income record not found or you don't have permission.");
        } else {
          setGeneralError("Failed to load income details.");
        }
      } finally {
        setIsLoadingIncome(false);
      }
    };
    if (incomeId) {
      loadIncome();
    }
  }, [incomeId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerErrors({});
    setGeneralError(null);

    try {
      await updateMutation.mutateAsync({ id: incomeId, data: data as UpdateIncomeDto });
      router.push(ROUTES.INCOMES);
    } catch (error: any) {
      const status = error?.status;

      if (status === 400 && error?.details?.data) {
        setServerErrors(error.details.data as Record<string, string>);
      } else if (status === 404) {
        setGeneralError(error?.message || "Income record not found or you don't have permission");
      } else {
        setGeneralError(error?.message || "An error occurred while updating the income record, please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
        <Link
          href={ROUTES.INCOMES}
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Incomes</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">Edit Income</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Edit Income
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Update source, received amount, date, and description
          </p>
        </div>

        {isLoadingIncome ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-sm text-gray-500">Loading income details...</p>
          </div>
        ) : income ? (
          <IncomeForm
            initialData={{
              source: income.source,
              amount: income.amount,
              date: income.date,
              note: income.note || "",
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            serverErrors={serverErrors}
            generalError={generalError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            {generalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-900 leading-relaxed mb-4">
                <span className="text-red-600 font-bold">!</span>
                <span>{generalError}</span>
              </div>
            )}
            <Link
              href={ROUTES.INCOMES}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Incomes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
