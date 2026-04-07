import type { Transaction } from "@/types";

export function calculateMonthlyTotals(
  transactions: Transaction[],
  yearMonth: string
): { income: number; expenses: number; net: number } {
  const monthTxns = transactions.filter(
    (t) => t.date.startsWith(yearMonth) && t.status === "confirmed"
  );

  let income = 0;
  let expenses = 0;

  for (const t of monthTxns) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  }

  return { income, expenses, net: income - expenses };
}

export function calculateTutoringTax(transactions: Transaction[]): {
  totalIncome: number;
  taxSetAside: number;
  taxRate: number;
} {
  const taxRate = 0.15;
  const totalIncome = transactions
    .filter((t) => t.category === "Tutoring" && t.type === "income" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    taxSetAside: totalIncome * taxRate,
    taxRate,
  };
}

export function calculateCategoryTotals(
  transactions: Transaction[],
  yearMonth?: string
): Record<string, number> {
  const filtered = transactions.filter(
    (t) =>
      t.status === "confirmed" &&
      t.type === "expense" &&
      (!yearMonth || t.date.startsWith(yearMonth))
  );

  const totals: Record<string, number> = {};
  for (const t of filtered) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  return totals;
}

export function calculateLOCInterest(balance: number, annualRate: number): number {
  // balance is negative (debt), rate is percentage (e.g. 7.95)
  return Math.abs(balance) * (annualRate / 100 / 12);
}
