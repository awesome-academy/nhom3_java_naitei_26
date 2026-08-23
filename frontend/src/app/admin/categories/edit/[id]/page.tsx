"use client";

import { useParams } from "next/navigation";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import { useAdminCategory } from "@/features/admin-category/hooks";

export default function EditAdminCategoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: category, isLoading } = useAdminCategory(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading category data...
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Category not found.
      </div>
    );
  }

  return <AdminCategoryForm initialData={category} isEdit={true} />;
}
