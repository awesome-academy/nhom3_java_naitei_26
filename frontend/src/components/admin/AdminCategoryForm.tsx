"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft, Save } from "lucide-react";
import { CategoryAdminRequest, CategoryAdminResponse } from "@/features/admin-category/types";
import { useCreateAdminCategory, useUpdateAdminCategory } from "@/features/admin-category/hooks";


interface Props {
  initialData?: CategoryAdminResponse;
  isEdit?: boolean;
}

export default function AdminCategoryForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();

  const [formData, setFormData] = useState<CategoryAdminRequest>({
    name: "",
    type: "EXPENSE",
    icon: "category",
    description: "",
  });
  const [serverError, setServerError] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        icon: initialData.icon || "category",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data: formData }, {
        onSuccess: () => router.push("/admin/categories"),
        onError: (error: any) => {
          if (error?.status === 409) {
            setServerError(error.message || "Global category already exists");
          }
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => router.push("/admin/categories"),
        onError: (error: any) => {
          if (error?.status === 409) {
            setServerError(error.message || "Global category already exists");
          }
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
        <Link href="/admin/categories" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Global Categories
        </Link>
        <span>/</span>
        <span className="text-slate-900">Category Form</span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create / Edit Global Category</h1>
          <p className="text-sm text-slate-500 mt-1">Configure name, description, and classification type (Expense / Income)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (serverError) setServerError("");
              }}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 ${
                serverError 
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
              }`}
              placeholder="e.g., Food & Dining"
            />
            {serverError && (
              <p className="text-red-500 text-sm mt-1">{serverError}</p>
            )}
          </div>

          {/* Classification Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Category Classification Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  formData.type === "EXPENSE" 
                    ? "border-blue-600 bg-blue-50/50" 
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg ${formData.type === "EXPENSE" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-400"}`}>
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h4 className={`font-bold ${formData.type === "EXPENSE" ? "text-blue-900" : "text-slate-700"}`}>Expense Category</h4>
                  <p className={`text-xs mt-1 ${formData.type === "EXPENSE" ? "text-blue-700/80" : "text-slate-500"}`}>For user expenditure records</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "INCOME" })}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  formData.type === "INCOME" 
                    ? "border-emerald-500 bg-emerald-50/50" 
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg ${formData.type === "INCOME" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400"}`}>
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <h4 className={`font-bold ${formData.type === "INCOME" ? "text-emerald-900" : "text-slate-700"}`}>Income Category</h4>
                  <p className={`text-xs mt-1 ${formData.type === "INCOME" ? "text-emerald-700/80" : "text-slate-500"}`}>For user earning records</p>
                </div>
              </button>
            </div>
          </div>

          {/* System Icon */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Icon
            </label>
            <div className="flex flex-wrap gap-3">
              {(["restaurant", "home", "directions_car", "account_balance", "shopping_bag", "work"]).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all ${
                    formData.icon === icon
                      ? formData.type === "EXPENSE" ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                      : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]" style={formData.icon === icon ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 resize-none"
              placeholder="Detailed description of the category..."
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="rounded-xl border-slate-200 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
