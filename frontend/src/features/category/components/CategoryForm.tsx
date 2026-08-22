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
  /** Lỗi từ server (400 Bad Request) — key = field name, value = error message */
  serverErrors?: Record<string, string>;
  /** Lỗi chung (ví dụ: 403, 409) — hiển thị ở đầu form */
  generalError?: string | null;
}

const ICON_OPTIONS = [
  "restaurant",
  "home",
  "directions_car",
  "shopping_bag",
  "fitness_center",
  "school",
  "work",
  "savings",
  "payments",
  "account_balance",
  "local_hospital",
  "flight",
];

/**
 * CategoryForm — Form tái sử dụng cho cả tạo mới và chỉnh sửa danh mục.
 *
 * Use case "Thêm danh mục":
 * - Bấm "Thêm danh mục" & nhập Form → Bấm "Lưu"
 * - Dữ liệu hợp lệ? → POST /api/categories → Thông báo thành công & cập nhật danh sách
 * - Dữ liệu sai? → 400 Bad Request → Hiển thị lỗi tại Form
 */
export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  serverErrors = {},
  generalError = null,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [icon, setIcon] = useState(initialData?.icon || "restaurant");
  const [description, setDescription] = useState(initialData?.description || "");
  const type: CategoryType = "EXPENSE"; // Hardcoded to EXPENSE as categories are only for expenses now

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

      {/* General error message (403, 409, etc.) */}
      {generalError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-900 leading-relaxed">
          <span className="material-symbols-outlined text-red-600 flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
            error
          </span>
          <span>{generalError}</span>
        </div>
      )}

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
          placeholder="e.g., Food & Dining, Transportation, Utilities"
          className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${
            serverErrors.name ? "border-red-300 bg-red-50/30" : "border-gray-200"
          }`}
        />
        {serverErrors.name && (
          <p className="text-xs text-red-600 mt-1">{serverErrors.name}</p>
        )}
      </div>

      {/* Icon Selector Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Icon
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
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all text-gray-500 hover:border-gray-300">
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
          placeholder="What kind of expenses belong to this category?"
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
