"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, LoaderCircle, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { useReportComparison, useReportSummary, useReportTrend } from "@/features/report/hooks";
import type { ReportPeriod, ReportTrendPoint } from "@/features/report/types";
import { formatCurrency } from "@/lib/utils";

const periodLabels: Record<ReportPeriod, string> = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

const categoryColors = ["bg-blue-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-500"];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodValue(period: ReportPeriod, date: Date) {
  if (period === "month") return date.toISOString().slice(0, 7);
  if (period === "year") return String(date.getFullYear());
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

function getSelectedPeriodRange(period: ReportPeriod, value: string) {
  const selectedDate = getDateForPeriod(period, value);

  if (period === "month") {
    const from = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const to = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    return { from: formatDate(from), to: formatDate(to) };
  }

  if (period === "quarter") {
    const from = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const to = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 3, 0);
    return { from: formatDate(from), to: formatDate(to) };
  }

  const from = new Date(selectedDate.getFullYear(), 0, 1);
  const to = new Date(selectedDate.getFullYear(), 12, 0);
  return { from: formatDate(from), to: formatDate(to) };
}

function getDaysInSelectedPeriod(period: ReportPeriod, value: string) {
  const range = getSelectedPeriodRange(period, value);
  const from = new Date(`${range.from}T00:00:00Z`);
  const to = new Date(`${range.to}T00:00:00Z`);
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

function getDateForPeriod(period: ReportPeriod, value: string) {
  if (period === "month") {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  if (period === "quarter") {
    const [year, quarter] = value.split("-Q").map(Number);
    return new Date(year, (quarter - 1) * 3, 1);
  }
  return new Date(Number(value), 0, 1);
}

function getPeriodOptions(period: ReportPeriod, date: Date) {
  if (period === "month") {
    return Array.from({ length: 12 }, (_, index) => {
      const optionDate = new Date(date.getFullYear(), date.getMonth() - index, 1);
      return { value: getPeriodValue(period, optionDate), label: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(optionDate) };
    });
  }
  if (period === "quarter") {
    return Array.from({ length: 8 }, (_, index) => {
      const optionDate = new Date(date.getFullYear(), date.getMonth() - index * 3, 1);
      return { value: getPeriodValue(period, optionDate), label: `Q${Math.floor(optionDate.getMonth() / 3) + 1} ${optionDate.getFullYear()}` };
    });
  }
  return Array.from({ length: 5 }, (_, index) => {
    const year = date.getFullYear() - index;
    return { value: String(year), label: String(year) };
  });
}

function formatTrendLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1, 1));
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const referenceDate = useMemo(() => new Date(), []);
  const [periodValue, setPeriodValue] = useState(getPeriodValue("month", referenceDate));
  const periodParams = useMemo(
    () => ({ period, value: periodValue }),
    [period, periodValue]
  );
  const trendRange = useMemo(() => getSelectedPeriodRange(period, periodValue), [period, periodValue]);
  const daysInSelectedPeriod = useMemo(() => getDaysInSelectedPeriod(period, periodValue), [period, periodValue]);
  const periodOptions = useMemo(() => getPeriodOptions(period, referenceDate), [period, referenceDate]);
  const summaryQuery = useReportSummary(periodParams);
  const comparisonQuery = useReportComparison(periodParams);
  const trendQuery = useReportTrend(trendRange);
  const isLoading = summaryQuery.isLoading || comparisonQuery.isLoading || trendQuery.isLoading;
  const hasError = summaryQuery.isError || comparisonQuery.isError || trendQuery.isError;
  const trendPoints = trendQuery.data ?? [];
  const categories = summaryQuery.data?.byCategory ?? [];
  const trendDescription = `Income and expense trend for the selected ${periodLabels[period].toLowerCase()}`;
  const maxTrendValue = Math.max(
    1,
    ...trendPoints.flatMap((point) => [point.income, point.expense])
  );
  const totalExpense = summaryQuery.data?.totalExpense ?? 0;
  const topCategory = categories.reduce(
    (top, category) => (category.amount > (top?.amount ?? 0) ? category : top),
    categories[0]
  );

  const renderState = (message: string) => (
    <div className="flex h-48 items-center justify-center text-sm text-gray-400">{message}</div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Deep-dive financial visual analytics, trends, and categorical distribution
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          {(Object.keys(periodLabels) as ReportPeriod[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              onClick={() => {
                setPeriod(option);
                setPeriodValue(getPeriodValue(option, referenceDate));
              }}
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
        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
        >
          <CalendarDays className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <span className="sr-only">Select report period</span>
          <select
            aria-label="Select report period"
            value={periodValue}
            onChange={(event) => setPeriodValue(event.target.value)}
            className="cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium text-gray-700 outline-none"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </label>
        <span className="text-xs text-gray-400">Data for selected period</span>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="border-emerald-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Net Savings</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
            {isLoading ? <LoaderCircle className="h-6 w-6 animate-spin" aria-label="Loading" /> : formatCurrency(comparisonQuery.data?.balance ?? 0)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            {comparisonQuery.data && comparisonQuery.data.totalIncome > 0
              ? `Savings Rate: ${((comparisonQuery.data.balance / comparisonQuery.data.totalIncome) * 100).toFixed(1)}%`
              : "No savings data available"}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Daily Average Spending</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{formatCurrency((summaryQuery.data?.totalExpense ?? 0) / daysInSelectedPeriod)}</p>
          <p className="mt-2 text-xs text-gray-500">Average expense per day in the selected period</p>
        </Card>
        <Card className="border-blue-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Top Expense Category</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{topCategory?.name ?? "-"}</p>
          <p className="mt-2 text-xs text-gray-500">
            {topCategory && totalExpense > 0
              ? `${((topCategory.amount / totalExpense) * 100).toFixed(1)}% of total expenditures (${formatCurrency(topCategory.amount)})`
              : "No category data available"}
          </p>
        </Card>
      </section>

      {hasError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load complete report data. Please try again later.
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-bold text-gray-900">Income vs. Expense Trend</h2>
              <p className="mt-0.5 text-xs text-gray-500">{trendDescription}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Income</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Expense</span>
            </div>
          </div>
          {isLoading ? renderState("Loading trend data...") : trendPoints.length === 0 ? renderState("No trend data available") : (
            <div className="flex h-64 items-end justify-between gap-2 px-1 sm:gap-4">
            {trendPoints.map((point: ReportTrendPoint) => (
              <div key={point.period} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-48 w-full items-end justify-center gap-1 sm:gap-1.5">
                  <div
                    className="w-1/2 rounded-t-md bg-emerald-500 transition-all"
                    style={{ height: `${(point.income / maxTrendValue) * 100}%` }}
                    title={`Income: ${formatCurrency(point.income)}`}
                  />
                  <div
                    className="w-1/2 rounded-t-md bg-rose-500 transition-all"
                    style={{ height: `${(point.expense / maxTrendValue) * 100}%` }}
                    title={`Expense: ${formatCurrency(point.expense)}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {formatTrendLabel(point.period)}
                </span>
              </div>
            ))}
            </div>
          )}
        </Card>

        <Card className="p-5 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-bold text-gray-900">Category Distribution</h2>
              <p className="mt-0.5 text-xs text-gray-500">Top spending categories this period</p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-gray-500">
              Total: {formatCurrency(totalExpense)}
            </span>
          </div>
          {isLoading ? renderState("Loading category distribution...") : categories.length === 0 ? renderState("No category data available") : (
          <div className="space-y-5 pt-1">
            {categories.map((category, index) => (
              <div key={category.name}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold">
                  <span className="text-gray-900">{category.name}</span>
                  <span className="shrink-0 tabular-nums text-gray-500">
                    {formatCurrency(category.amount)} ({totalExpense > 0 ? ((category.amount / totalExpense) * 100).toFixed(1) : "0.0"}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${categoryColors[index % categoryColors.length]}`} style={{ width: `${totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          )}
        </Card>
      </section>
    </div>
  );
}
