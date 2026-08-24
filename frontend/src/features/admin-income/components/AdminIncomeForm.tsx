import { useForm } from "react-hook-form";
import { AdminIncome, IncomeRequest } from "../types";
import Input from "@/components/ui/Input";
import { format } from "date-fns";

interface AdminIncomeFormProps {
  initialData?: AdminIncome;
  onSubmit: (data: IncomeRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AdminIncomeForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: AdminIncomeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeRequest>({
    defaultValues: {
      source: initialData?.source || "",
      amount: initialData?.amount || 0,
      date: initialData?.date || format(new Date(), "yyyy-MM-dd"),
      note: initialData?.note || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {initialData && (
        <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
              {initialData.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-emerald-900">
                Record Owner: {initialData.userName}
              </p>
              <p className="text-sm text-emerald-600">
                {initialData.userEmail} (User ID: USR-{initialData.userId})
              </p>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded border border-emerald-200 text-emerald-700 text-sm font-medium">
            Verified Income Entry
          </div>
        </div>
      )}

      <div>
        <Input
          label="INCOME SOURCE / TITLE *"
          placeholder="e.g., Tech Corp Main Salary"
          error={errors.source?.message}
          {...register("source", {
            required: "Income source is required",
          })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            type="number"
            step="0.01"
            label="AMOUNT *"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
              valueAsNumber: true,
            })}
          />
        </div>
        <div>
          <Input
            type="date"
            label="RECEIVED DATE *"
            error={errors.date?.message}
            {...register("date", { required: "Date is required" })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          INCOME CLASSIFICATION TYPE *
        </label>
        <select
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
        >
          <option>Income (Standard)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Incomes currently do not have specific categories.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          REMARKS & TRANSACTION NOTES
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Monthly gross salary transfer from Tech Corp payroll account."
          {...register("note")}
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        {initialData ? (
          <div className="text-red-500 font-medium opacity-50 cursor-not-allowed">
            Delete managed in list view
          </div>
        ) : (
          <div></div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#0B4AC4] text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update Income"
              : "Save Income"}
          </button>
        </div>
      </div>
    </form>
  );
};
