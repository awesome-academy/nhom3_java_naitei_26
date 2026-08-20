"use client";

import { Search, RotateCcw } from "lucide-react";

interface IncomeFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  onReset: () => void;
}

/**
 * Income type filter options — theo design spec U07.
 */
const INCOME_TYPE_OPTIONS = [
  { value: "", label: "All Income Types" },
  { value: "Salary", label: "Monthly Salary" },
  { value: "Freelance", label: "Freelance Contract" },
  { value: "Investment", label: "Investment & Dividends" },
  { value: "Bonus", label: "Bonus / Commission" },
];

/**
 * Date range filter options — theo design spec U07.
 */
const DATE_RANGE_OPTIONS = [
  { value: "this_month", label: "This Month (Oct 2026)" },
  { value: "last_month", label: "Last Month (Sep 2026)" },
  { value: "year", label: "This Year (2026)" },
];

/**
 * IncomeFilterBar — Thanh tìm kiếm + bộ lọc cho trang Income Management.
 * Thiết kế theo U07 design reference:
 * - Search input bên trái (flex-1)
 * - Income Type dropdown + Date range dropdown + Reset button bên phải
 */
export default function IncomeFilterBar({
  searchValue,
  onSearchChange,
  typeFilter,
  onTypeChange,
  dateFilter,
  onDateChange,
  onReset,
}: IncomeFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by income source, client, or amount..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Income Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23515f74' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {INCOME_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Date Range Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23515f74' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
