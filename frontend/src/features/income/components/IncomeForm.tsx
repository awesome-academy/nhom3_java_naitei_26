"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { CreateIncomeDto, UpdateIncomeDto } from "../types";
import { ROUTES } from "@/lib/constants";

interface IncomeFormProps {
  initialData?: Partial<CreateIncomeDto>;
  onSubmit: (data: CreateIncomeDto | UpdateIncomeDto) => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string>;
  generalError?: string | null;
}

/**
 * IncomeForm — Form tái sử dụng cho cả Create và Edit Income.
 * Category đã được loại bỏ khỏi Income theo yêu cầu.
 */
export default function IncomeForm({
  initialData,
  onSubmit,
  isLoading = false,
  serverErrors = {},
  generalError = null,
}: IncomeFormProps) {
  const [source, setSource] = useState(initialData?.source || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(initialData?.note || "");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      source,
      amount: parseFloat(amount) || 0,
      date,
      note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Banner */}
      {generalError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-900 leading-relaxed">
          <span className="text-red-600 font-bold">!</span>
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Income Source Name */}
        <div className="md:col-span-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            htmlFor="source"
          >
            Income Source / Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="source"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., Tech Corp Salary, Freelance Web Design"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
          {serverErrors.source && (
            <p className="mt-1 text-xs text-red-600">{serverErrors.source}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            htmlFor="amount"
          >
            Amount <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-gray-500 text-sm">
              ₫
            </span>
            <input
              type="number"
              step="1"
              id="amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-14 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              VNĐ
            </span>
          </div>
          {serverErrors.amount && (
            <p className="mt-1 text-xs text-red-600">{serverErrors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            htmlFor="date"
          >
            Received Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="date"
            required
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
          {serverErrors.date && (
            <p className="mt-1 text-xs text-red-600">{serverErrors.date}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
          htmlFor="notes"
        >
          Description / Remarks
        </label>
        <textarea
          id="notes"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add optional notes or payment references..."
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Link
          href={ROUTES.INCOMES}
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          isLoading={isLoading}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm active:scale-[0.98] transition-all"
        >
          <Check className="h-[18px] w-[18px]" />
          <span>Save Income</span>
        </Button>
      </div>
    </form>
  );
}
