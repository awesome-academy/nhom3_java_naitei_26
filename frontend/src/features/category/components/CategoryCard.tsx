"use client";

import Link from "next/link";
import type { Category, CategoryType } from "../types";
import { CATEGORY_TYPE_STYLES } from "../types";
import { ROUTES } from "@/lib/constants";

interface CategoryCardProps {
  category: Category;
  onDeleteClick: (category: Category) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: "restaurant",
  home: "home",
  directions_car: "directions_car",
  shopping_bag: "shopping_bag",
  fitness_center: "fitness_center",
  school: "school",
  default: "category",
};

/**
 * CategoryCard — Hiển thị 1 danh mục dạng card.
 *
 * Use case "Xem danh sách":
 * - Danh mục Chung (COMMON): chỉ hiển thị nút "Xem"
 * - Danh mục Riêng (PRIVATE): hiển thị nút "Sửa / Xoá"
 */
export default function CategoryCard({ category, onDeleteClick }: CategoryCardProps) {
  const styles = CATEGORY_TYPE_STYLES[category.type as CategoryType] || CATEGORY_TYPE_STYLES.EXPENSE;
  const iconName = CATEGORY_ICONS[category.icon || "default"] || "category";
  const isCommon = category.scope === "COMMON";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-2xl ${styles.iconBg} ${styles.iconText} flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition-transform`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "26px" }}
            >
              {iconName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Badge loại danh mục */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}
            >
              {category.type === "EXPENSE" ? "Expense" : "Income"}
            </span>
            {/* Badge phạm vi */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                isCommon
                  ? "bg-gray-100 text-gray-600"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {isCommon ? "Common" : "Private"}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {category.description || "No description."}
        </p>
      </div>

      {/* Footer: tuỳ theo scope hiển thị nút khác nhau */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        {isCommon ? (
          <>
            <span className="text-xs text-gray-400 font-medium italic">
              System category
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 text-gray-400 text-xs font-medium">
              <span className="material-symbols-outlined mr-1" style={{ fontSize: "16px" }}>
                visibility
              </span>
              Read-only
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400 font-medium">
              Private category
            </span>
            <div className="flex items-center gap-1">
              <Link
                href={`${ROUTES.CATEGORIES}/edit/${category.id}`}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  edit
                </span>
              </Link>
              <button
                onClick={() => onDeleteClick(category)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  delete
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
