"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CategoryCard, DeleteCategoryModal } from "@/features/category/components";
import type { Category } from "@/features/category/types";
import { ROUTES } from "@/lib/constants";

// Mock data based on design reference U09
const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Food & Dining",
    description: "Restaurants, groceries, coffee shops, and meal delivery services.",
    icon: "restaurant",
    type: "EXPENSE",
    transactionCount: 18,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Housing & Utilities",
    description: "Apartment rent, electricity, water, high-speed fiber internet bills.",
    icon: "home",
    type: "EXPENSE",
    transactionCount: 4,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Transportation",
    description: "Fuel, public transit, rideshare services, vehicle maintenance.",
    icon: "directions_car",
    type: "EXPENSE",
    transactionCount: 12,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  },
];

export default function CategoriesPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      // TODO: Connect to API
      console.log("Deleting category:", categoryToDelete.id);
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="w-full flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Personal Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your financial records by custom expenditure & income classifications
          </p>
        </div>
        <Link
          href={`${ROUTES.CATEGORIES}/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span>Create Category</span>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* Delete Modal */}
      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
