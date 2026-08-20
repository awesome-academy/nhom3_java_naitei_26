"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { IncomeType, CreateIncomeDto, UpdateIncomeDto } from "../types";
import { ROUTES } from "@/lib/constants";

interface IncomeFormProps {
  initialData?: Partial<CreateIncomeDto>;
  onSubmit: (data: CreateIncomeDto | UpdateIncomeDto) => void;
  isLoading?: boolean;
}

const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "Salary", label: "Salary (Monthly Payroll)" },
  { value: "Freelance", label: "Freelance Contract" },
  { value: "Investment", label: "Dividends & Investments" },
  { value: "Rental", label: "Rental Income" },
  { value: "Bonus", label: "Bonus / Gift" },
];

/**
 * IncomeForm — Component form tái sử dụng cho cả Create và Edit Income.
 * Dựng chính xác theo UI design reference U08.
 */
export default function IncomeForm({
  initialData,
  onSubmit,
  isLoading = false,
}: IncomeFormProps) {
  const [source, setSource] = useState(initialData?.source || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(initialData?.date || "2026-10-05");
  const [type, setType] = useState<IncomeType>(
    initialData?.type || "Salary"
  );
  const [note, setNote] = useState(initialData?.note || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      source,
      amount: parseFloat(amount) || 0,
      date,
      type,
      note,
      description: source, // Legacy field
      categoryId: `cat-${type.toLowerCase()}`, // Mock ID
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              $
            </span>
            <input
              type="number"
              step="0.01"
              id="amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-14 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              USD
            </span>
          </div>
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Income Type */}
        <div className="md:col-span-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            htmlFor="type"
          >
            Income Type <span className="text-red-600">*</span>
          </label>
          <select
            id="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value as IncomeType)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all appearance-none cursor-pointer pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23515f74' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
            }}
          >
            {INCOME_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
