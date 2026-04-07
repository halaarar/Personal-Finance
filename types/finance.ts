export type TransactionType = "income" | "expense";
export type TransactionStatus = "confirmed" | "pending" | "skipped";
export type AccountKey = "cibc_chequing" | "cibc_credit" | "bmo_chequing" | "bmo_loc" | "osap" | "cash";
export type Theme = "light" | "dark";
export type Frequency = "weekly" | "biweekly" | "monthly";

export const EXPENSE_CATEGORIES = [
  "Phone",
  "Subscriptions",
  "Transit",
  "Groceries",
  "Eating Out",
  "Shopping",
  "Entertainment",
  "Loan Interest",
  "Loan Extra Payment",
  "Move Fund",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Tutoring",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // always positive, type determines sign
  account: AccountKey;
  notes: string;
  recurring_id?: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  name: string;
  default_amount: number;
  frequency: Frequency;
  day_of_week?: number; // 0=Sunday, 6=Saturday
  day_of_month?: number; // 1-31
  days_of_week?: number[]; // for multi-day (e.g. Mon & Fri tutoring)
  account: AccountKey;
  category: string;
  start_date: string;
  active: boolean;
  notes: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  rate: number;
  hours: number;
  active: boolean;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  due: string;
}

export interface Settings {
  loc_rate: number;
  split: { loc: number; move: number; personal: number };
  move_target: number;
  move_saved: number;
  osap_deferred_until: string;
  theme: Theme;
}

export interface QuickLogButton {
  id: string;
  label: string;
  type: TransactionType;
  default_amount: number;
  category: string;
  account: AccountKey;
}

export interface MonthlySnapshot {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  loc_balance: number;
  move_fund: number;
  net_worth: number;
}

export interface Accounts {
  cibc_chequing: number;
  cibc_credit: number;
  bmo_chequing: number;
  bmo_loc: number;
  osap: number;
}

export interface FinanceData {
  accounts: Accounts;
  income_sources: IncomeSource[];
  fixed_expenses: FixedExpense[];
  recurring_transactions: RecurringTransaction[];
  transactions: Transaction[];
  settings: Settings;
  monthly_snapshots: MonthlySnapshot[];
  quick_log_buttons: QuickLogButton[];
}
