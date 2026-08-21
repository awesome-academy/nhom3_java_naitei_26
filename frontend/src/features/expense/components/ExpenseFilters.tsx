import { RotateCcw, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { ExpenseFilterErrors } from "../filterUtils";
import type { ExpenseCategoryOption, ExpenseFilterValues } from "../types";

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
      aria-label="Bộ lọc chi tiêu"
      className="rounded-2xl border border-gray-200 bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search
            aria-hidden="true"
            className="absolute bottom-3 left-3 z-10 h-4 w-4 text-gray-400"
          />
          <Input
            aria-label="Tìm theo tên khoản chi"
            className="pl-9"
            label="Tìm kiếm"
            placeholder="Tìm theo tên khoản chi..."
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>
        <Select
          aria-label="Danh mục"
          label="Danh mục"
          value={values.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
          options={[
            { label: "Tất cả danh mục", value: "" },
            ...categories.map((category) => ({ label: category.name, value: String(category.id) })),
          ]}
        />
        <Input
          aria-label="Từ ngày"
          label="Từ ngày"
          type="date"
          value={values.fromDate}
          onChange={(event) => onChange("fromDate", event.target.value)}
        />
        <Input
          aria-label="Đến ngày"
          label="Đến ngày"
          type="date"
          value={values.toDate}
          onChange={(event) => onChange("toDate", event.target.value)}
        />
        <div className="flex items-end justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Đặt lại
          </Button>
        </div>
        <Input
          aria-label="Số tiền tối thiểu"
          label="Số tiền từ"
          type="number"
          min="0"
          placeholder="Tiền tối thiểu"
          value={values.minAmount}
          onChange={(event) => onChange("minAmount", event.target.value)}
        />
        <Input
          aria-label="Số tiền tối đa"
          label="Số tiền đến"
          type="number"
          min="0"
          placeholder="Tiền tối đa"
          value={values.maxAmount}
          onChange={(event) => onChange("maxAmount", event.target.value)}
        />
      </div>
      {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
      {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
      {isCategoryFallback && (
        <p className="mt-2 text-xs text-amber-700">
          Category API chưa sẵn sàng; danh mục đang lấy tạm từ danh sách chi tiêu.
        </p>
      )}
    </section>
  );
}
