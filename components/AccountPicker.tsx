"use client";

import { cn } from "@/lib/utils";
import { ACCOUNT_OPTIONS } from "@/lib/constants";
import type { AccountKey } from "@/types";

interface AccountPickerProps {
  selected: AccountKey;
  onSelect: (account: AccountKey) => void;
}

export function AccountPicker({ selected, onSelect }: AccountPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACCOUNT_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]",
            selected === opt.key
              ? "bg-navy text-white"
              : "bg-gray-100 text-gray-700 dark:bg-dark-border dark:text-gray-300"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
