"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types";
import { ACCOUNT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TransactionFilters as Filters } from "@/hooks/useTransactionFilters";

interface TransactionFiltersProps {
  filters: Filters;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onAccountChange: (account: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function TransactionFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onAccountChange,
  onClearFilters,
  hasActiveFilters,
}: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const allCategories = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transactions..."
          className={cn(
            "w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900",
            "dark:border-dark-border dark:bg-dark-card dark:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-navy/50",
            "min-h-[44px] text-base placeholder:text-gray-400"
          )}
        />
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-navy dark:text-savings-light font-medium"
        >
          {showFilters ? "Hide filters" : "Filters"}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm text-expense font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* Category filter */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategoryChange(filters.category === cat ? "" : cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px]",
                      filters.category === cat
                        ? "bg-navy text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Account filter */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account</p>
              <div className="flex flex-wrap gap-1.5">
                {ACCOUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onAccountChange(filters.account === opt.key ? "" : opt.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px]",
                      filters.account === opt.key
                        ? "bg-navy text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
