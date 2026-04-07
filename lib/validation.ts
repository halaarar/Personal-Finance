import type { FinanceData, Transaction } from "@/types";
import { getDefaultFinanceData } from "./defaults";

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isValidAccounts(val: unknown): boolean {
  if (!isObject(val)) return false;
  const required = ["cibc_chequing", "cibc_credit", "bmo_chequing", "bmo_loc", "osap"];
  return required.every((key) => typeof val[key] === "number");
}

function isValidSettings(val: unknown): boolean {
  if (!isObject(val)) return false;
  const s = val as Record<string, unknown>;
  return (
    typeof s.loc_rate === "number" &&
    isObject(s.split) &&
    typeof (s.split as Record<string, unknown>).loc === "number" &&
    typeof (s.split as Record<string, unknown>).move === "number" &&
    typeof (s.split as Record<string, unknown>).personal === "number" &&
    typeof s.move_target === "number" &&
    typeof s.move_saved === "number" &&
    typeof s.osap_deferred_until === "string" &&
    typeof s.theme === "string"
  );
}

export function isValidTransaction(val: unknown): val is Transaction {
  if (!isObject(val)) return false;
  const t = val as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    (t.type === "income" || t.type === "expense") &&
    (t.status === "confirmed" || t.status === "pending" || t.status === "skipped") &&
    typeof t.date === "string" &&
    typeof t.description === "string" &&
    typeof t.category === "string" &&
    typeof t.amount === "number" &&
    t.amount >= 0 &&
    typeof t.account === "string" &&
    typeof t.notes === "string"
  );
}

function isValidTransactions(val: unknown): boolean {
  if (!Array.isArray(val)) return false;
  return val.every(isValidTransaction);
}

function isValidQuickLogButtons(val: unknown): boolean {
  if (!Array.isArray(val)) return false;
  return val.every(
    (b) =>
      isObject(b) &&
      typeof b.id === "string" &&
      typeof b.label === "string" &&
      (b.type === "income" || b.type === "expense") &&
      typeof b.default_amount === "number" &&
      typeof b.category === "string" &&
      typeof b.account === "string"
  );
}

/**
 * Validates and sanitizes finance data.
 * Preserves valid sections and replaces corrupt ones with defaults.
 */
export function validateFinanceData(data: unknown): FinanceData {
  const defaults = getDefaultFinanceData();

  if (!isObject(data)) return defaults;

  const d = data as Record<string, unknown>;

  return {
    accounts: isValidAccounts(d.accounts) ? (d.accounts as FinanceData["accounts"]) : defaults.accounts,
    income_sources: Array.isArray(d.income_sources) ? (d.income_sources as FinanceData["income_sources"]) : defaults.income_sources,
    fixed_expenses: Array.isArray(d.fixed_expenses) ? (d.fixed_expenses as FinanceData["fixed_expenses"]) : defaults.fixed_expenses,
    recurring_transactions: Array.isArray(d.recurring_transactions) ? (d.recurring_transactions as FinanceData["recurring_transactions"]) : defaults.recurring_transactions,
    transactions: isValidTransactions(d.transactions) ? (d.transactions as Transaction[]) : defaults.transactions,
    settings: isValidSettings(d.settings) ? (d.settings as FinanceData["settings"]) : defaults.settings,
    monthly_snapshots: Array.isArray(d.monthly_snapshots) ? (d.monthly_snapshots as FinanceData["monthly_snapshots"]) : defaults.monthly_snapshots,
    quick_log_buttons: isValidQuickLogButtons(d.quick_log_buttons) ? (d.quick_log_buttons as FinanceData["quick_log_buttons"]) : defaults.quick_log_buttons,
  };
}
