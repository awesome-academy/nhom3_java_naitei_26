"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useAdminCategories } from "@/features/admin-category/hooks";
import { AdminCategoryFilters, CategoryAdminResponse } from "@/features/admin-category/types";
import DeleteGlobalCategoryModal from "@/components/admin/DeleteGlobalCategoryModal";
import { format } from "date-fns";

export default function AdminCategoriesPage() {
  const [filters, setFilters] = useState<AdminCategoryFilters>({
    page: 0,
    size: 10,
    search: "",
    type: "",
  });

  const { data, isLoading } = useAdminCategories(filters);
  const categories = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryAdminResponse | null>(null);

  const handleDeleteClick = (category: CategoryAdminResponse) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global System Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Configure predefined system categories available for all standard user expense and income records</p>
        </div>
        <Link href="/admin/categories/create">
          <Button variant="primary" className="flex items-center gap-2 rounded-xl px-5 py-2.5 shadow-sm bg-blue-700 hover:bg-blue-800 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="font-semibold text-sm">Create New Category</span>
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search category name or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as any, page: 0 })}
          className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700 shadow-sm appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="">All Classification Types</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 hidden md:table-cell">Description</th>
                <th className="px-6 py-4">System Usage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading categories...
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No categories found matching your criteria.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                          category.type === "EXPENSE" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">{category.icon || "category"}</span>
                        </div>
                        <span className="font-bold text-slate-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        category.type === "EXPENSE" ? "bg-pink-100/50 text-pink-600" : "bg-emerald-100/50 text-emerald-600"
                      }`}>
                        {category.type === "EXPENSE" ? "Expense" : "Income"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 whitespace-normal">
                      <span className="line-clamp-1">{category.description || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{category.usageCount.toLocaleString()}</span>
                      <span className="text-slate-400 font-medium ml-1">records</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/edit/${category.id}`}>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(category)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{categories.length > 0 ? (filters.page || 0) * (filters.size || 10) + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(((filters.page || 0) + 1) * (filters.size || 10), data?.totalElements || 0)}</span> of <span className="font-bold text-slate-700">{data?.totalElements || 0}</span> global categories
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: Math.max(0, (filters.page || 0) - 1) })}
              disabled={!filters.page || filters.page === 0}
              className="px-3 text-slate-500 border-slate-200 rounded-lg"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters({ ...filters, page: i })}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  filters.page === i ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: (filters.page || 0) + 1 })}
              disabled={(filters.page || 0) >= totalPages - 1}
              className="px-3 text-slate-500 border-slate-200 rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <DeleteGlobalCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        category={categoryToDelete}
      />
    </div>
  );
}
