import type { AccountKey, QuickLogButton } from "@/types";

export const STORAGE_KEY = "hala_finance_data";

export const ACCOUNT_OPTIONS: { key: AccountKey; label: string }[] = [
  { key: "cibc_chequing", label: "CIBC Chequing" },
  { key: "cibc_credit", label: "CIBC Credit" },
  { key: "bmo_chequing", label: "BMO Chequing" },
  { key: "bmo_loc", label: "BMO LOC" },
  { key: "cash", label: "Cash" },
];

export const ACCOUNT_DISPLAY_NAMES: Record<string, string> = {
  cibc_chequing: "CIBC Chequing",
  cibc_credit: "CIBC Credit",
  bmo_chequing: "BMO Chequing",
  bmo_loc: "BMO LOC",
  osap: "OSAP",
  cash: "Cash",
};

export const DEFAULT_QUICK_LOG_BUTTONS: QuickLogButton[] = [
  {
    id: "ql-tutoring",
    label: "Tutoring",
    type: "income",
    default_amount: 35,
    category: "Tutoring",
    account: "cibc_chequing",
  },
  {
    id: "ql-coffee",
    label: "Coffee",
    type: "expense",
    default_amount: 5,
    category: "Eating Out",
    account: "cibc_chequing",
  },
  {
    id: "ql-groceries",
    label: "Groceries",
    type: "expense",
    default_amount: 0,
    category: "Groceries",
    account: "cibc_chequing",
  },
  {
    id: "ql-transit",
    label: "Transit",
    type: "expense",
    default_amount: 3.35,
    category: "Transit",
    account: "cibc_chequing",
  },
];
