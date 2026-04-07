import type { FinanceData, Transaction } from "@/types";
import { calculateLOCInterest } from "./calculations";
import { differenceInDays, parseISO, format } from "date-fns";
import { getTodayString } from "./utils";

// === Move Fund ===

export function calculateMoveFundProgress(
  transactions: Transaction[],
  initialSaved: number,
  moveTarget: number
): { saved: number; target: number; percentage: number; monthsToGo: number | null } {
  // Sum all confirmed "Move Fund" category transactions (income adds, expense subtracts)
  const fromTransactions = transactions
    .filter((t) => t.category === "Move Fund" && t.status === "confirmed")
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

  const saved = initialSaved + fromTransactions;
  const percentage = moveTarget > 0 ? Math.min(100, Math.round((saved / moveTarget) * 100)) : 0;

  // Estimate months to go based on average monthly contribution
  // Look at last 3 months of Move Fund income
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentContributions = transactions.filter(
    (t) =>
      t.category === "Move Fund" &&
      t.type === "income" &&
      t.status === "confirmed" &&
      parseISO(t.date) >= threeMonthsAgo
  );

  const totalRecent = recentContributions.reduce((s, t) => s + t.amount, 0);
  const monthsOfData = Math.max(1, Math.min(3, (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  const avgMonthly = totalRecent / monthsOfData;

  const remaining = moveTarget - saved;
  const monthsToGo = remaining <= 0 ? 0 : avgMonthly > 0 ? Math.ceil(remaining / avgMonthly) : null;

  return { saved: Math.max(0, saved), target: moveTarget, percentage, monthsToGo };
}

// === LOC Snapshot ===

export function calculateLOCSnapshot(
  locBalance: number,
  locRate: number,
  transactions: Transaction[]
): {
  balance: number;
  monthlyInterest: number;
  monthlyExtra: number;
  totalPayment: number;
  principalReduction: number;
  monthsToPayoff: number | null;
} {
  const monthlyInterest = calculateLOCInterest(locBalance, locRate);

  // Calculate average monthly extra payment from "Loan Extra Payment" transactions
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentExtraPayments = transactions.filter(
    (t) =>
      t.category === "Loan Extra Payment" &&
      t.status === "confirmed" &&
      parseISO(t.date) >= threeMonthsAgo
  );

  const totalExtra = recentExtraPayments.reduce((s, t) => s + t.amount, 0);
  const monthsOfData = Math.max(1, Math.min(3, (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  const monthlyExtra = totalExtra / monthsOfData;

  const totalPayment = monthlyInterest + monthlyExtra;
  const principalReduction = monthlyExtra;

  // Months to payoff (simple approximation assuming constant extra payments)
  const absBalance = Math.abs(locBalance);
  let monthsToPayoff: number | null = null;
  if (monthlyExtra > 0) {
    // With compound interest approximation
    let remaining = absBalance;
    let months = 0;
    const monthlyRate = locRate / 100 / 12;
    while (remaining > 0 && months < 600) {
      const interest = remaining * monthlyRate;
      remaining = remaining + interest - monthlyExtra;
      months++;
      if (remaining <= 0) break;
    }
    monthsToPayoff = months < 600 ? months : null;
  }

  return {
    balance: locBalance,
    monthlyInterest: Math.round(monthlyInterest * 100) / 100,
    monthlyExtra: Math.round(monthlyExtra * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    principalReduction: Math.round(principalReduction * 100) / 100,
    monthsToPayoff,
  };
}

// === Action Items ===

export interface ActionItem {
  type: "urgent" | "warning" | "info";
  message: string;
  detail?: string;
}

export function getActionItems(data: FinanceData): ActionItem[] {
  const items: ActionItem[] = [];
  const today = getTodayString();
  const todayDate = parseISO(today);

  // CIBC Credit Card balance
  if (data.accounts.cibc_credit < 0) {
    const dueDate = "2026-04-14";
    const daysUntil = differenceInDays(parseISO(dueDate), todayDate);
    if (daysUntil > 0) {
      items.push({
        type: daysUntil <= 7 ? "urgent" : "warning",
        message: `CIBC Credit Card: $${Math.abs(data.accounts.cibc_credit).toFixed(2)} due`,
        detail: `${daysUntil} day${daysUntil === 1 ? "" : "s"} left (Apr 14)`,
      });
    } else if (daysUntil <= 0) {
      items.push({
        type: "urgent",
        message: `CIBC Credit Card: $${Math.abs(data.accounts.cibc_credit).toFixed(2)} OVERDUE`,
        detail: "Payment was due April 14",
      });
    }
  }

  // OSAP deferral countdown
  if (data.settings.osap_deferred_until) {
    const deferralDate = parseISO(data.settings.osap_deferred_until);
    const daysUntil = differenceInDays(deferralDate, todayDate);
    if (daysUntil > 0 && daysUntil <= 90) {
      items.push({
        type: daysUntil <= 30 ? "warning" : "info",
        message: "OSAP deferral ending soon",
        detail: `${daysUntil} days until ${format(deferralDate, "MMM d, yyyy")}`,
      });
    } else if (daysUntil <= 0) {
      items.push({
        type: "urgent",
        message: "OSAP deferral has ended",
        detail: "Review repayment options or apply to defer again",
      });
    }
  }

  // CMS rate TBD
  const cmsRecurring = data.recurring_transactions.find(
    (r) => r.name.toLowerCase().includes("cms") && r.active && r.default_amount === 0
  );
  if (cmsRecurring) {
    items.push({
      type: "warning",
      message: "CMS (Jennifer): rate not set",
      detail: "Update in Settings → Recurring Transactions",
    });
  }

  // Overdue pending transactions
  const overduePending = data.transactions.filter(
    (t) => t.status === "pending" && t.date < today
  );
  if (overduePending.length > 0) {
    items.push({
      type: "warning",
      message: `${overduePending.length} overdue pending transaction${overduePending.length === 1 ? "" : "s"}`,
      detail: "Review and confirm or skip them",
    });
  }

  return items;
}
