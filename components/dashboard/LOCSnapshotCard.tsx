"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { calculateLOCSnapshot } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function LOCSnapshotCard() {
  const { data } = useFinanceData();

  const snapshot = useMemo(
    () =>
      calculateLOCSnapshot(
        data.accounts.bmo_loc,
        data.settings.loc_rate,
        data.transactions
      ),
    [data.accounts.bmo_loc, data.settings.loc_rate, data.transactions]
  );

  return (
    <Card>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        BMO Line of Credit
      </p>

      {/* Balance */}
      <p className="text-2xl font-bold text-expense mb-3">
        {formatCurrency(Math.abs(snapshot.balance))}
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly interest</span>
          <span className="text-sm font-semibold text-expense">
            {formatCurrency(snapshot.monthlyInterest)}
          </span>
        </div>

        {snapshot.monthlyExtra > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Extra payment (avg)</span>
              <span className="text-sm font-semibold text-income">
                {formatCurrency(snapshot.monthlyExtra)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Principal reduction</span>
              <span className="text-sm font-semibold text-income">
                {formatCurrency(snapshot.principalReduction)}
              </span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-border">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total payment</span>
          <span className="text-sm font-semibold">
            {formatCurrency(snapshot.totalPayment)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Payoff timeline</span>
          <span className="text-sm font-semibold">
            {snapshot.monthsToPayoff === null
              ? "Interest-only"
              : snapshot.monthsToPayoff <= 12
                ? `${snapshot.monthsToPayoff} months`
                : `${Math.round(snapshot.monthsToPayoff / 12 * 10) / 10} years`}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        Rate: {data.settings.loc_rate}% annually
      </p>
    </Card>
  );
}
