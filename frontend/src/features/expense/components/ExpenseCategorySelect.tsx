"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpenseCategoryOption } from "../types";

interface ExpenseCategorySelectProps {
  id: string;
  label: string;
  value: string;
  categories: ExpenseCategoryOption[];
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function ExpenseCategorySelect({
  id,
  label,
  value,
  categories,
  placeholder,
  error,
  onChange,
}: ExpenseCategorySelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((category) => String(category.id) === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const selectCategory = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label id={`${id}-label`} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-options`}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
          "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        )}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => event.key === "Escape" && setIsOpen(false)}
      >
        <CategoryLabel category={selectedCategory} fallback={placeholder} />
        <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>
      {isOpen && (
        <ul
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <CategoryOption
            label={placeholder}
            value=""
            isSelected={!value}
            onSelect={selectCategory}
          />
          {categories.map((category) => (
            <CategoryOption
              key={category.id}
              category={category}
              label={category.name}
              value={String(category.id)}
              isSelected={String(category.id) === value}
              onSelect={selectCategory}
            />
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function CategoryLabel({
  category,
  fallback,
}: {
  category?: ExpenseCategoryOption;
  fallback: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {category?.icon?.trim() && <CategoryIcon icon={category.icon} />}
      <span className="truncate">{category?.name ?? fallback}</span>
    </span>
  );
}

function CategoryOption({
  category,
  label,
  value,
  isSelected,
  onSelect,
}: {
  category?: ExpenseCategoryOption;
  label: string;
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <li role="option" aria-selected={isSelected}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50",
          isSelected && "bg-blue-600 text-white hover:bg-blue-600"
        )}
        onClick={() => onSelect(value)}
      >
        {category?.icon?.trim() && <CategoryIcon icon={category.icon} />}
        <span>{label}</span>
      </button>
    </li>
  );
}

function CategoryIcon({ icon }: { icon: string }) {
  return (
    <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
      {icon}
    </span>
  );
}
