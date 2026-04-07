"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { formatCurrency } from "@/lib/utils";
import { ACCOUNT_DISPLAY_NAMES } from "@/lib/constants";
import { Card } from "./ui/Card";
import { cn } from "@/lib/utils";

export function KPICards() {
  const { data } = useFinanceData();

  const summary = useMemo(() => {
    const { accounts } = data;
    const totalCash = accounts.cibc_chequing + accounts.bmo_chequing + Math.max(0, accounts.cibc_credit);
    const totalDebt =
      Math.abs(Math.min(0, accounts.cibc_credit)) +
      Math.abs(Math.min(0, accounts.bmo_loc)) +
      Math.abs(Math.min(0, accounts.osap));
    const netWorth =
      accounts.cibc_chequing +
      accounts.cibc_credit +
      accounts.bmo_chequing +
      accounts.bmo_loc +
      accounts.osap;

    return { totalCash, totalDebt, netWorth };
  }, [data.accounts]);

  const accountEntries = useMemo(() => {
    return Object.entries(data.accounts).map(([key, val]) => ({
      key,
      label: ACCOUNT_DISPLAY_NAMES[key] || key,
      value: val as number,
    }));
  }, [data.accounts]);

  return (
    <div className="space-y-3">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cash</p>
          <p className="text-lg font-bold text-income mt-0.5">{formatCurrency(summary.totalCash)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Debt</p>
          <p className="text-lg font-bold text-expense mt-0.5">{formatCurrency(summary.totalDebt)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Net Worth</p>
          <p className={cn("text-lg font-bold mt-0.5", summary.netWorth >= 0 ? "text-income" : "text-expense")}>
            {formatCurrency(summary.netWorth)}
          </p>
        </Card>
      </div>

      {/* Individual account balances — always visible */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Accounts</p>
        <div className="space-y-1.5">
          {accountEntries.map((acc) => (
            <div key={acc.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{acc.label}</span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  acc.value >= 0 ? "text-income" : "text-expense"
                )}
              >
                {formatCurrency(acc.value)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
