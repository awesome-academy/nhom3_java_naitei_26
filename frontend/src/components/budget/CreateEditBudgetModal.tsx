"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useExpenseCategories } from "@/features/expense/hooks";
import { useCreateBudget, useUpdateBudget } from "@/features/budget/hooks";
import type { Budget } from "@/features/budget/types";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  amount: z
    .string()
    .min(1, "Vui lòng nhập số tiền")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Số tiền ngân sách phải lớn hơn 0",
    }),
  month: z.string().min(1, "Vui lòng chọn tháng"),
  year: z.string().min(1, "Vui lòng chọn năm"),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

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
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = Boolean(budget);

  const {
    register,
    handleSubmit,
    reset,
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
            toast.success("Cập nhật ngân sách thành công");
            onClose();
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật ngân sách");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Tạo ngân sách thành công");
          onClose();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Không thể tạo ngân sách");
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa ngân sách" : "Thiết lập ngân sách mới"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Danh mục chi tiêu"
          options={categories.map((c) => ({
            label: c.name,
            value: String(c.id),
          }))}
          placeholder="Chọn danh mục áp dụng ngân sách"
          error={errors.categoryId?.message}
          {...register("categoryId")}
        />

        <Input
          label="Hạn mức ngân sách (VNĐ)"
          type="number"
          min="1"
          step="1"
          placeholder="Ví dụ: 3000000"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tháng áp dụng"
            options={Array.from({ length: 12 }, (_, i) => ({
              label: `Tháng ${i + 1}`,
              value: String(i + 1),
            }))}
            error={errors.month?.message}
            {...register("month")}
          />

          <Select
            label="Năm áp dụng"
            options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
              label: `Năm ${y}`,
              value: String(y),
            }))}
            error={errors.year?.message}
            {...register("year")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? "Lưu thay đổi" : "Thiết lập"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
