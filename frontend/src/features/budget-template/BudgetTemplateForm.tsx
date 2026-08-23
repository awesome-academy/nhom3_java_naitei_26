"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useCategories } from "@/features/category/hooks";
import { useBudgetTemplate, useCreateBudgetTemplate, useUpdateBudgetTemplate } from "./hooks";
import type {
  BudgetTemplateDetailDto,
  CreateBudgetTemplateDto,
  UpdateBudgetTemplateDto,
} from "./types";

interface BudgetTemplateFormProps {
  mode: "create" | "edit";
  id?: string;
}

interface FormValues {
  name: string;
  month: string;
  warningPercentage: string;
  details: BudgetTemplateDetailDto[];
}

const emptyDetail = (): BudgetTemplateDetailDto => ({
  categoryId: "",
  amount: 0,
});

const initialValues: FormValues = {
  name: "",
  month: "",
  warningPercentage: "",
  details: [emptyDetail()],
};

export default function BudgetTemplateForm({ mode, id }: BudgetTemplateFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();
  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
  } = useBudgetTemplate(id ?? "");
  const createMutation = useCreateBudgetTemplate();
  const updateMutation = useUpdateBudgetTemplate();
  const mutation = isEdit ? updateMutation : createMutation;
  const expenseCategories =
    categories?.filter((category: Category) => category.type === "EXPENSE") ?? [];
  const total = values.details.reduce((sum, detail) => sum + (detail.amount || 0), 0);

  useEffect(() => {
    if (isEdit && template) {
      setValues({
        name: template.name,
        month: String(template.month),
        warningPercentage: String(template.warningPercentage),
        details:
          template.details.length > 0
            ? template.details.map((detail) => ({
                categoryId: detail.categoryId,
                amount: detail.amount,
              }))
            : [emptyDetail()],
      });
    }
  }, [isEdit, template]);

  useEffect(() => {
    if (mutation.isSuccess) {
      router.push("/admin/budget-templates");
    }
  }, [mutation.isSuccess, router]);

  if (isEdit && templateLoading) {
    return <FormState message="Loading budget template..." />;
  }

  if (isEdit && templateError) {
    return <FormState message="Unable to load budget template." isError />;
  }

  const updateDetail = (index: number, field: keyof BudgetTemplateDetailDto, value: string) => {
    setValues((current) => ({
      ...current,
      details: current.details.map((detail, detailIndex) =>
        detailIndex === index
          ? { ...detail, [field]: field === "amount" ? Number(value) : value }
          : detail
      ),
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[`details.${index}.${field}`];
      return nextErrors;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const month = Number(values.month);
    const warningPercentage = Number(values.warningPercentage);

    if (!values.name.trim()) nextErrors.name = "Template name is required";
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      nextErrors.month = "Month must be between 1 and 12";
    }
    if (
      !Number.isInteger(warningPercentage) ||
      warningPercentage < 50 ||
      warningPercentage > 100 ||
      warningPercentage % 5 !== 0
    ) {
      nextErrors.warningPercentage = "Use a value from 50 to 100 in steps of 5";
    }
    if (values.details.length === 0) {
      nextErrors.details = "At least one category row is required";
    }
    values.details.forEach((detail, index) => {
      if (!detail.categoryId) {
        nextErrors[`details.${index}.categoryId`] = "Category is required";
      }
      if (!Number.isFinite(detail.amount) || detail.amount <= 0) {
        nextErrors[`details.${index}.amount`] = "Amount must be positive";
      }
    });

    const duplicateCategoryIds = new Set<string>();
    const uniqueCategoryIds = new Set<string>();
    values.details.forEach((detail) => {
      if (!detail.categoryId) return;
      const categoryId = String(detail.categoryId);
      if (uniqueCategoryIds.has(categoryId)) {
        duplicateCategoryIds.add(categoryId);
      }
      uniqueCategoryIds.add(categoryId);
    });
    if (duplicateCategoryIds.size > 0) {
      values.details.forEach((detail, index) => {
        if (duplicateCategoryIds.has(String(detail.categoryId))) {
          nextErrors[`details.${index}.categoryId`] = "Each category can only be selected once";
        }
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const data = {
      name: values.name.trim(),
      month: Number(values.month),
      warningPercentage: Number(values.warningPercentage),
      details: values.details,
    };

    if (isEdit) {
      updateMutation.mutate({
        id: id ?? "",
        data: data as UpdateBudgetTemplateDto,
      });
    } else {
      createMutation.mutate(data as CreateBudgetTemplateDto);
    }
  };

  const addDetail = () => {
    setValues((current) => ({
      ...current,
      details: [...current.details, emptyDetail()],
    }));
  };

  const removeDetail = (index: number) => {
    setValues((current) => ({
      ...current,
      details: current.details.filter((_, detailIndex) => detailIndex !== index),
    }));
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-[#515f74]">
        <button
          type="button"
          onClick={() => router.push("/admin/budget-templates")}
          className="flex items-center gap-1 transition-colors hover:text-[#004ac6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Budget Templates
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-[#131b2e]">Template Form</span>
      </nav>

      <Card className="rounded-2xl border-[#E2E8F0] p-6 shadow-sm md:p-8">
        <div className="mb-6 border-b border-[#E2E8F0] pb-4">
          <h2 className="text-xl font-bold text-[#131b2e] md:text-2xl">
            {isEdit ? "Edit Budget Template" : "Create Budget Template"}
          </h2>
          <p className="mt-1 text-xs text-[#515f74]">
            Define template name, default target month, and repeatable default category allocations
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Template Name"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              error={errors.name}
              placeholder="e.g. Standard Living Budget"
              className="rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm focus:bg-white"
            />
            <Input
              label="Default Target Month"
              type="number"
              min={1}
              max={12}
              value={values.month}
              onChange={(event) => setValues({ ...values, month: event.target.value })}
              error={errors.month}
              className="rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm focus:bg-white"
            />
            <Input
              label="Warning Percentage"
              type="number"
              min={50}
              max={100}
              step={5}
              value={values.warningPercentage}
              onChange={(event) => setValues({ ...values, warningPercentage: event.target.value })}
              error={errors.warningPercentage}
              className="rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm focus:bg-white"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#515f74]">
                Default Categories &amp; Allocated Amounts <span className="text-red-600">*</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addDetail}
                className="rounded-lg bg-blue-50 text-[#004ac6] hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add Category Row
              </Button>
            </div>

            <div className="space-y-3">
              {values.details.map((detail, index) => (
                <div
                  key={`${index}-${detail.categoryId}`}
                  className="flex flex-col items-stretch gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1 sm:min-w-[200px]">
                    <Select
                      label={`Category ${index + 1}`}
                      options={expenseCategories.map((category: Category) => ({
                        label: category.name,
                        value: category.id,
                      }))}
                      placeholder={
                        categoriesLoading ? "Loading categories..." : "Select expense category"
                      }
                      value={detail.categoryId}
                      onChange={(event) => updateDetail(index, "categoryId", event.target.value)}
                      error={errors[`details.${index}.categoryId`]}
                      disabled={categoriesLoading}
                      className="rounded-lg bg-white text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:w-44">
                    <Input
                      label="Amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={detail.amount || ""}
                      onChange={(event) => updateDetail(index, "amount", event.target.value)}
                      error={errors[`details.${index}.amount`]}
                      className="rounded-lg bg-white font-mono text-xs font-semibold"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDetail(index)}
                    aria-label={`Remove category ${index + 1}`}
                    title="Remove row"
                    className="self-end text-[#515f74] hover:bg-red-50 hover:text-red-600 sm:self-center"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {categoriesError && (
              <p className="mt-2 text-sm text-red-600">Unable to load expense categories.</p>
            )}
            {errors.details && <p className="mt-2 text-sm text-red-600">{errors.details}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-slate-50 p-4 text-sm">
            <span className="font-semibold text-[#515f74]">Calculated Template Total:</span>
            <span className="font-mono text-lg font-bold text-[#004ac6]">
              {formatAmount(total)} USD
            </span>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center">
            {mutation.isError && (
              <p className="mr-auto text-sm text-red-600">
                Unable to save the budget template. Please try again.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/budget-templates")}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending} className="rounded-xl px-6">
              <Save className="h-4 w-4" />
              Save Budget Template
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function FormState({ message, isError = false }: { message: string; isError?: boolean }) {
  return (
    <Card>
      <div
        className={`flex min-h-48 items-center justify-center text-sm ${isError ? "text-red-600" : "text-[#515f74]"}`}
      >
        {message}
      </div>
    </Card>
  );
}
