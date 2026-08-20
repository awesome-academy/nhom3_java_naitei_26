"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { CategoryType, CreateCategoryDto, UpdateCategoryDto } from "../types";
import { ROUTES } from "@/lib/constants";

interface CategoryFormProps {
  initialData?: Partial<CreateCategoryDto>;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  isLoading?: boolean;
}

const ICON_OPTIONS = [
  "restaurant",
  "home",
  "directions_car",
  "shopping_bag",
  "fitness_center",
  "school",
];

export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [icon, setIcon] = useState(initialData?.icon || "restaurant");
  const [description, setDescription] = useState(initialData?.description || "");
  // Using EXPENSE as default since it's most common for categories
  const [type, setType] = useState<CategoryType>(initialData?.type || "EXPENSE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      icon,
      description,
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Category Type Selection (Radio) - Custom addition for completeness though not explicitly in U10 screenshot, it's necessary for domain */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Category Type <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-4">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="EXPENSE"
              checked={type === "EXPENSE"}
              onChange={() => setType("EXPENSE")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-900 font-medium">Expense</span>
          </label>
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="INCOME"
              checked={type === "INCOME"}
              onChange={() => setType("INCOME")}
              className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-600"
            />
            <span className="text-sm text-gray-900 font-medium">Income</span>
          </label>
        </div>
      </div>

      {/* Category Name */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
          htmlFor="name"
        >
          Category Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Food & Dining, Freelance, Fitness"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Icon Selector Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Select Category Icon
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
          {ICON_OPTIONS.map((iconName) => (
            <label key={iconName} className="cursor-pointer">
              <input
                type="radio"
                name="icon"
                value={iconName}
                checked={icon === iconName}
                onChange={() => setIcon(iconName)}
                className="sr-only peer"
              />
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all text-gray-500">
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  {iconName}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
          htmlFor="desc"
        >
          Description
        </label>
        <textarea
          id="desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What expenses or earnings belong in this category?"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Link
          href={ROUTES.CATEGORIES}
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          isLoading={isLoading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm active:scale-[0.98] transition-all"
        >
          <Check className="h-[18px] w-[18px] mr-2" />
          <span>Save Category</span>
        </Button>
      </div>
    </form>
  );
}
