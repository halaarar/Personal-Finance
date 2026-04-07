"use client";

import { useTutoringTax } from "@/hooks/useTutoringTax";
import { useFinanceData } from "@/hooks/useFinanceData";
import { formatCurrency } from "@/lib/utils";
import { Card } from "./ui/Card";

export function TutoringTaxCard() {
  const { data } = useFinanceData();
  const { totalIncome, taxSetAside } = useTutoringTax(data.transactions);

  if (totalIncome === 0) return null;

  return (
    <Card className="border-personal/20 bg-personal/5 dark:bg-personal/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-personal">Tutoring Tax Tracker</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            15% set aside for self-employment tax
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-personal">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tax: {formatCurrency(taxSetAside)}
          </p>
        </div>
      </div>
    </Card>
  );
}
