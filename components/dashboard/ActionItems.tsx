"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { getActionItems, type ActionItem } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const typeConfig: Record<ActionItem["type"], { icon: string; bg: string; text: string }> = {
  urgent: { icon: "🔴", bg: "bg-expense/5 border-expense/20", text: "text-expense" },
  warning: { icon: "🟡", bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-700/30", text: "text-amber-700 dark:text-amber-400" },
  info: { icon: "🔵", bg: "bg-savings/5 border-savings/20", text: "text-savings" },
};

export function ActionItems() {
  const { data } = useFinanceData();

  const items = useMemo(() => getActionItems(data), [data]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">Action Items</p>
      {items.map((item, i) => {
        const config = typeConfig[item.type];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2.5 p-3 rounded-xl border",
              config.bg
            )}
          >
            <span className="text-sm mt-0.5">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", config.text)}>{item.message}</p>
              {item.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
