"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useExpenseCategories } from "@/features/expense/hooks";
import { useBudgetTemplates, useCreateBudget, useUpdateBudget } from "@/features/budget/hooks";
import type { Budget, BudgetTemplateResponse } from "@/features/budget/types";
import { BudgetTemplateDetailDto } from "@/features/budget-template/types";
import { Wand2 } from "lucide-react";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z
    .string()
    .min(1, "Please enter a budget amount")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "The budget amount must be greater than 0",
    }),
  month: z.string().min(1, "Please select a month"),
  year: z.string().min(1, "Please select a year"),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const resData = error.response?.data;
    
    // 1. Trường hợp Backend trả về ApiResponse chuẩn: { message: "...", error: "...", data: null }
    if (resData?.message) return resData.message;
    if (resData?.error) return resData.error;
    
    // 2. Trường hợp lỗi validation fields: { errors: { categoryId: "..." } } hoặc { errors: ["..."] }
    if (resData?.errors) {
      if (Array.isArray(resData.errors)) return resData.errors.join(", ");
      if (typeof resData.errors === "object") {
        return Object.values(resData.errors).join(", ");
      }
    }

    // 3. Fallback theo mã HTTP Status
    if (error.response?.status === 409 || error.response?.status === 400) {
      return "Ngân sách cho danh mục này đã tồn tại trong tháng được chọn. Vui lòng chỉnh sửa ngân sách hiện có hoặc chọn danh mục khác.";
    }
  }
  return fallback;
}

interface CreateEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget | null;
  defaultMonth: number;
  defaultYear: number;
}

export default function CreateEditBudgetModal({
  isOpen,
  onClose,
  budget,
  defaultMonth,
  defaultYear,
}: CreateEditBudgetModalProps) {
  const { data: categories = [] } = useExpenseCategories();
  const { data: templates = [] } = useBudgetTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = Boolean(budget);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
      month: String(defaultMonth),
      year: String(defaultYear),
    },
  });

  const selectedCategoryId = useWatch({
    control,
    name: "categoryId",
  });

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        reset({
          categoryId: String(budget.categoryId),
          amount: String(budget.amount),
          month: String(budget.month),
          year: String(budget.year),
        });
      } else {
        reset({
          categoryId: "",
          amount: "",
          month: String(defaultMonth),
          year: String(defaultYear),
        });
      }
    }
  }, [isOpen, budget, defaultMonth, defaultYear, reset]);

  // Khi chọn một template có sẵn từ Admin
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);

    // Khi chọn lại "-- Select a Template --" (value rỗng) -> Xoá sạch và đưa về mặc định
    if (!templateId) {
      setValue("categoryId", "", { shouldValidate: true });
      setValue("amount", "", { shouldValidate: true });
      setValue("month", String(defaultMonth), { shouldValidate: true });
      setValue("year", String(defaultYear), { shouldValidate: true });
      return;
    }

    const tpl = templates.find((t: BudgetTemplateResponse) => String(t.id) === templateId);
    if (tpl) {
      if (tpl.month) {
        setValue("month", String(tpl.month), { shouldValidate: true });
      }
      if (tpl.details && tpl.details.length > 0) {
        const firstDetail = tpl.details[0];
        setValue("categoryId", String(firstDetail.categoryId), { shouldValidate: true });
        setValue("amount", String(firstDetail.amount), { shouldValidate: true });
      }
    }
  };

  // Tự động điền lại Amount nếu User đổi Category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value;
    setValue("categoryId", newCategoryId, { shouldValidate: true });

    if (selectedTemplateId) {
      const tpl = templates.find((t: BudgetTemplateResponse) => String(t.id) === selectedTemplateId);
      const matched = tpl?.details?.find(
        (d: BudgetTemplateDetailDto) => String(d.categoryId) === newCategoryId
      );
      if (matched) {
        setValue("amount", String(matched.amount), { shouldValidate: true });
      }
    }
  };

  const onSubmit = (values: BudgetFormValues) => {
    const payload = {
      categoryId: Number(values.categoryId),
      amount: Number(values.amount),
      month: Number(values.month),
      year: Number(values.year),
    };

    if (isEditing && budget) {
      updateMutation.mutate(
        { id: budget.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Budget updated successfully");
            onClose();
          },
          onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Unable to update budget"));
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Budget created successfully");
          onClose();
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Unable to create budget"));
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Budget" : "New Budget"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Dropdown chọn Admin Template (chỉ xuất hiện ở chế độ Tạo mới) */}
        {!isEditing && templates.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
              <Wand2 className="h-3.5 w-3.5 text-blue-600" />
              Fill from Template (Optional)
            </label>
            <Select
              options={[
                { label: "-- Select a Template --", value: "" },
                ...templates.map((t: BudgetTemplateResponse) => ({
                  label: `${t.name} (Month ${t.month})`,
                  value: String(t.id),
                })),
              ]}
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-white text-xs"
            />
          </div>
        )}
        
        <Select
          label="Expense Category"
          options={categories.map((c) => ({
            label: c.name,
            value: String(c.id),
          }))}
          placeholder="Select a category for this budget"
          error={errors.categoryId?.message}
          value={selectedCategoryId}
          onChange={handleCategoryChange}
        />

        <Input
          label="Budget Limit (VND)"
          type="number"
          min="1"
          step="1"
          placeholder="Example: 3000000"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Month"
            options={Array.from({ length: 12 }, (_, i) => ({
              label: `Month ${i + 1}`,
              value: String(i + 1),
            }))}
            error={errors.month?.message}
            {...register("month")}
          />

          <Select
            label="Year"
            options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
              label: `Year ${y}`,
              value: String(y),
            }))}
            error={errors.year?.message}
            {...register("year")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? "Save Changes" : "Create Budget"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
