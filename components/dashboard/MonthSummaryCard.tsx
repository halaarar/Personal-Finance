"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { calculateMonthlyTotals } from "@/lib/calculations";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function MonthSummaryCard() {
  const { data } = useFinanceData();

  const totals = useMemo(
    () => calculateMonthlyTotals(data.transactions, getCurrentMonth()),
    [data.transactions]
  );

  return (
    <Card>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">This Month</p>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          <p className="font-bold text-income">{formatCurrency(totals.income)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
          <p className="font-bold text-expense">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
          <p className={`font-bold ${totals.net >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(totals.net)}
          </p>
        </div>
      </div>
    </Card>
  );
}
