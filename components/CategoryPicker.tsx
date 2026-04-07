"use client";

import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TransactionType } from "@/types";

interface CategoryPickerProps {
  type: TransactionType;
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryPicker({ type, selected, onSelect }: CategoryPickerProps) {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]",
            selected === cat
              ? type === "income"
                ? "bg-income text-white"
                : "bg-expense text-white"
              : "bg-gray-100 text-gray-700 dark:bg-dark-border dark:text-gray-300"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
