import type { Transaction, TransactionType, AccountKey } from "@/types";
import { generateId, getTodayString } from "./utils";

export function createTransaction(partial: {
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  account: AccountKey;
  date?: string;
  notes?: string;
  status?: Transaction["status"];
  recurring_id?: string;
}): Transaction {
  return {
    id: generateId(),
    type: partial.type,
    status: partial.status || "confirmed",
    date: partial.date || getTodayString(),
    description: partial.description,
    category: partial.category,
    amount: Math.abs(partial.amount),
    account: partial.account,
    notes: partial.notes || "",
    recurring_id: partial.recurring_id,
  };
}

export function updateTransactionInList(
  transactions: Transaction[],
  id: string,
  updates: Partial<Omit<Transaction, "id">>
): Transaction[] {
  return transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
}

export function deleteTransactionFromList(transactions: Transaction[], id: string): Transaction[] {
  return transactions.filter((t) => t.id !== id);
}

export function getTransactionsByMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter(
    (t) => t.date.startsWith(yearMonth) && t.status === "confirmed"
  );
}

export function searchTransactions(transactions: Transaction[], query: string): Transaction[] {
  const q = query.toLowerCase().trim();
  if (!q) return transactions;
  return transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
  );
}

export function filterTransactions(
  transactions: Transaction[],
  filters: {
    search?: string;
    category?: string;
    account?: string;
    month?: string;
    type?: TransactionType;
  }
): Transaction[] {
  let result = transactions.filter((t) => t.status !== "skipped");

  if (filters.search) {
    result = searchTransactions(result, filters.search);
  }
  if (filters.category) {
    result = result.filter((t) => t.category === filters.category);
  }
  if (filters.account) {
    result = result.filter((t) => t.account === filters.account);
  }
  if (filters.month) {
    result = result.filter((t) => t.date.startsWith(filters.month!));
  }
  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }

  return result;
}

export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

export function groupTransactionsByDate(
  transactions: Transaction[]
): { date: string; transactions: Transaction[] }[] {
  const sorted = sortTransactionsByDate(transactions);
  const groups: Map<string, Transaction[]> = new Map();

  for (const t of sorted) {
    const existing = groups.get(t.date);
    if (existing) {
      existing.push(t);
    } else {
      groups.set(t.date, [t]);
    }
  }

  return Array.from(groups.entries()).map(([date, txns]) => ({
    date,
    transactions: txns,
  }));
}
