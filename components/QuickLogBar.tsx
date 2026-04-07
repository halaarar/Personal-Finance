"use client";

import { motion } from "framer-motion";
import type { QuickLogButton } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QuickLogBarProps {
  buttons: QuickLogButton[];
  onQuickLog: (button: QuickLogButton) => void;
  onAddNew: () => void;
}

export function QuickLogBar({ buttons, onQuickLog, onAddNew }: QuickLogBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-1">
      {buttons.map((btn) => (
        <motion.button
          key={btn.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onQuickLog(btn)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm min-h-[44px]",
            "flex items-center gap-1.5 shadow-sm border",
            btn.type === "income"
              ? "bg-income/10 text-income border-income/20"
              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-dark-card dark:text-gray-300 dark:border-dark-border"
          )}
        >
          <span>{btn.label}</span>
          {btn.default_amount > 0 && (
            <span className="opacity-70">{formatCurrency(btn.default_amount)}</span>
          )}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAddNew}
        className="flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm min-h-[44px] border-2 border-dashed border-gray-300 text-gray-500 dark:border-dark-border dark:text-gray-400"
      >
        + Custom
      </motion.button>
    </div>
  );
}
