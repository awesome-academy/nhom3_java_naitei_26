import { RotateCcw, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ExpenseFilterErrors } from "../filterUtils";
import type { ExpenseCategoryOption, ExpenseFilterValues } from "../types";
import ExpenseCategorySelect from "./ExpenseCategorySelect";

interface ExpenseFiltersProps {
  values: ExpenseFilterValues;
  categories: ExpenseCategoryOption[];
  errors: ExpenseFilterErrors;
  isCategoryFallback?: boolean;
  onChange: (field: keyof ExpenseFilterValues, value: string) => void;
  onReset: () => void;
}

export default function ExpenseFilters({
  values,
  categories,
  errors,
  isCategoryFallback = false,
  onChange,
  onReset,
}: ExpenseFiltersProps) {
  return (
    <section
      aria-label="Expense filters"
      className="rounded-2xl border border-gray-200 bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search
            aria-hidden="true"
            className="absolute bottom-3 left-3 z-10 h-4 w-4 text-gray-400"
          />
          <Input
            aria-label="Search by expense title"
            className="pl-9"
            label="Search"
            placeholder="Search by expense title..."
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>
        <ExpenseCategorySelect
          id="expense-filter-category"
          label="Category"
          value={values.categoryId}
          categories={categories}
          placeholder="All categories"
          onChange={(value) => onChange("categoryId", value)}
        />
        <Input
          aria-label="From date"
          label="From date"
          type="date"
          value={values.fromDate}
          onChange={(event) => onChange("fromDate", event.target.value)}
        />
        <Input
          aria-label="To date"
          label="To date"
          type="date"
          value={values.toDate}
          onChange={(event) => onChange("toDate", event.target.value)}
        />
        <div className="flex items-end justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
        <Input
          aria-label="Minimum amount"
          label="Minimum amount"
          type="number"
          min="0"
          placeholder="Minimum amount"
          value={values.minAmount}
          onChange={(event) => onChange("minAmount", event.target.value)}
        />
        <Input
          aria-label="Maximum amount"
          label="Maximum amount"
          type="number"
          min="0"
          placeholder="Maximum amount"
          value={values.maxAmount}
          onChange={(event) => onChange("maxAmount", event.target.value)}
        />
      </div>
      {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
      {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
      {isCategoryFallback && (
        <p className="mt-2 text-xs text-amber-700">
          The Category API is unavailable; categories are temporarily derived from expenses.
        </p>
      )}
    </section>
  );
}
