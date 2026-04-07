"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { calculateMoveFundProgress } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function MoveFundCard() {
  const { data } = useFinanceData();

  const progress = useMemo(
    () =>
      calculateMoveFundProgress(
        data.transactions,
        data.settings.move_saved,
        data.settings.move_target
      ),
    [data.transactions, data.settings.move_saved, data.settings.move_target]
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Move Out Fund</p>
        <span className="text-xs font-semibold text-savings">{progress.percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-savings rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm">
          <span className="font-bold text-savings">{formatCurrency(progress.saved)}</span>
          <span className="text-gray-500 dark:text-gray-400"> / {formatCurrency(progress.target)}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {progress.monthsToGo === null
            ? "Start saving to see estimate"
            : progress.monthsToGo === 0
              ? "Goal reached!"
              : `~${progress.monthsToGo} month${progress.monthsToGo === 1 ? "" : "s"} to go`}
        </p>
      </div>
    </Card>
  );
}
