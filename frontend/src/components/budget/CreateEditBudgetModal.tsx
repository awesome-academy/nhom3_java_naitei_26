"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useExpenseCategories } from "@/features/expense/hooks";
import { useCreateBudget, useUpdateBudget } from "@/features/budget/hooks";
import type { Budget } from "@/features/budget/types";

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
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
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
        <Select
          label="Expense Category"
          options={categories.map((c) => ({
            label: c.name,
            value: String(c.id),
          }))}
          placeholder="Select a category for this budget"
          error={errors.categoryId?.message}
          {...register("categoryId")}
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
