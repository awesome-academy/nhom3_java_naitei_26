"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

type ReportPeriod = "month" | "quarter" | "year";

interface TrendPoint {
  label: string;
  income: number;
  expense: number;
}

const trendPoints: TrendPoint[] = [
  { label: "May", income: 3800, expense: 2100 },
  { label: "Jun", income: 4000, expense: 2300 },
  { label: "Jul", income: 3900, expense: 2700 },
  { label: "Aug", income: 4200, expense: 2150 },
  { label: "Sep", income: 4100, expense: 2350 },
  { label: "Oct", income: 4500, expense: 2240 },
];

const categories = [
  { name: "Food & Dining", amount: 896, percentage: 40, color: "bg-blue-600" },
  { name: "Housing & Utilities", amount: 560, percentage: 25, color: "bg-indigo-600" },
  { name: "Transportation", amount: 448, percentage: 20, color: "bg-emerald-600" },
  { name: "Shopping & Leisure", amount: 336, percentage: 15, color: "bg-amber-500" },
];

const periodLabels: Record<ReportPeriod, string> = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const maxTrendValue = Math.max(...trendPoints.flatMap((point) => [point.income, point.expense]));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Phân tích dòng tiền, xu hướng và phân bổ chi tiêu
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          {(Object.keys(periodLabels) as ReportPeriod[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              onClick={() => setPeriod(option)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                period === option
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {periodLabels[option]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
        >
          <CalendarDays className="h-4 w-4 text-blue-600" aria-hidden="true" />
          {period === "month" ? "October 2026" : period === "quarter" ? "Q4 2026" : "2026"}
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </button>
        <span className="text-xs text-gray-400">Dữ liệu trình bày mẫu</span>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="border-emerald-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Net Savings</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">+$2,260.00</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Savings Rate: 50.2%
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Daily Average Spending</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">$74.66 / day</p>
          <p className="mt-2 text-xs text-gray-500">Across 24 active transaction days</p>
        </Card>
        <Card className="border-blue-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Top Expense Category</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">Food &amp; Dining</p>
          <p className="mt-2 text-xs text-gray-500">40% of total expenditures ($896.00)</p>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-bold text-gray-900">Income vs. Expense Trend</h2>
              <p className="mt-0.5 text-xs text-gray-500">Monthly cashflow comparison over the last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Income</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Expense</span>
            </div>
          </div>
          <div className="flex h-64 items-end justify-between gap-2 px-1 sm:gap-4">
            {trendPoints.map((point) => (
              <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-48 w-full items-end justify-center gap-1 sm:gap-1.5">
                  <div
                    className="w-1/2 rounded-t-md bg-emerald-500 transition-all"
                    style={{ height: `${(point.income / maxTrendValue) * 100}%` }}
                    title={`Income: ${money.format(point.income)}`}
                  />
                  <div
                    className="w-1/2 rounded-t-md bg-rose-500 transition-all"
                    style={{ height: `${(point.expense / maxTrendValue) * 100}%` }}
                    title={`Expense: ${money.format(point.expense)}`}
                  />
                </div>
                <span className={`text-[11px] font-semibold ${point.label === "Oct" ? "text-blue-700" : "text-gray-500"}`}>
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-bold text-gray-900">Category Distribution</h2>
              <p className="mt-0.5 text-xs text-gray-500">Top spending categories this period</p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-gray-500">Total: $2,240.00</span>
          </div>
          <div className="space-y-5 pt-1">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold">
                  <span className="text-gray-900">{category.name}</span>
                  <span className="shrink-0 tabular-nums text-gray-500">
                    {money.format(category.amount)} ({category.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${category.color}`} style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
