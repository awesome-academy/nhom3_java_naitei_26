"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { IncomeForm } from "@/features/income/components";
import type { CreateIncomeDto } from "@/features/income/types";
import { ROUTES } from "@/lib/constants";

/**
 * Add New Income Page (U08).
 * Tích hợp IncomeForm vào layout chuẩn theo thiết kế.
 */
export default function AddIncomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Connect to actual mutation when API is ready
      // const payload: CreateIncomeDto = data;
      console.log("Submitting new income:", data);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Navigate back after success
      router.push(ROUTES.INCOMES);
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
        <span className="text-gray-900 font-semibold">New Income</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Add / Edit Income
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Record incoming earnings or update existing income sources
          </p>
        </div>

        <IncomeForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
