"use client";

import { useAdminIncome, useUpdateAdminIncome } from "@/features/admin-income/hooks";
import { AdminIncomeForm } from "@/features/admin-income/components/AdminIncomeForm";
import { IncomeRequest } from "@/features/admin-income/types";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function EditAdminIncomePage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();

  const { data: income, isLoading, isError } = useAdminIncome(id);
  const { mutate: updateIncome, isPending } = useUpdateAdminIncome();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !income) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Income Record Not Found
        </h3>
        <p className="text-gray-500 mb-6">
          The income record you are trying to edit does not exist or you don't
          have permission to view it.
        </p>
        <Link
          href={ROUTES.ADMIN_INCOMES}
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to System Incomes
        </Link>
      </div>
    );
  }

  const handleSubmit = (data: IncomeRequest) => {
    updateIncome(
      { id, data },
      {
        onSuccess: () => {
          router.push(ROUTES.ADMIN_INCOMES);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link
          href={ROUTES.ADMIN_INCOMES}
          className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          System Incomes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-gray-400 font-normal">System Incomes /</span>{" "}
          Income Record #INC-{income.id}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <AdminIncomeForm
          initialData={income}
          onSubmit={handleSubmit}
          onCancel={() => router.push(ROUTES.ADMIN_INCOMES)}
          isSubmitting={isPending}
        />
      </div>
    </div>
  );
}
