"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import type { FinanceData, Transaction, TransactionType, AccountKey, QuickLogButton, Settings, Accounts, RecurringTransaction } from "@/types";
import { loadFinanceData, saveFinanceData, exportData, importData } from "@/lib/storage";
import { createTransaction, updateTransactionInList, deleteTransactionFromList } from "@/lib/transactions";
import { syncRecurringTransactions } from "@/lib/recurring";
import { getTodayString } from "@/lib/utils";
import { generateId } from "@/lib/utils";

interface FinanceDataContextValue {
  data: FinanceData;
  isLoaded: boolean;
  addTransaction: (partial: {
    type: TransactionType;
    description: string;
    category: string;
    amount: number;
    account: AccountKey;
    date?: string;
    notes?: string;
  }) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  confirmTransaction: (id: string) => void;
  skipTransaction: (id: string) => void;
  batchConfirmTransactions: (ids: string[]) => void;
  addRecurringTransaction: (partial: Omit<RecurringTransaction, "id">) => void;
  updateRecurringTransaction: (id: string, updates: Partial<Omit<RecurringTransaction, "id">>) => void;
  deleteRecurringTransaction: (id: string) => void;
  runRecurringSync: () => void;
  addQuickLogButton: (button: Omit<QuickLogButton, "id">) => void;
  updateQuickLogButton: (id: string, updates: Partial<Omit<QuickLogButton, "id">>) => void;
  deleteQuickLogButton: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  updateAccounts: (updates: Partial<Accounts>) => void;
  exportJSON: () => string;
  importJSON: (json: string) => { success: boolean; error?: string };
  setData: (data: FinanceData) => void;
}

export const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

// Helper: adjust an account balance for a transaction
function adjustAccount(
  accounts: FinanceData["accounts"],
  account: AccountKey,
  amount: number,
  type: TransactionType,
  direction: "add" | "reverse"
): FinanceData["accounts"] {
  if (account === "cash") return accounts;
  const key = account as keyof FinanceData["accounts"];
  if (!(key in accounts)) return accounts;

  const sign = type === "income" ? 1 : -1;
  const dirSign = direction === "add" ? 1 : -1;
  const delta = amount * sign * dirSign;

  return { ...accounts, [key]: Math.round((accounts[key] + delta) * 100) / 100 };
}

// Helper: run recurring sync on a FinanceData object (pure)
function runSync(financeData: FinanceData): FinanceData {
  const newTransactions = syncRecurringTransactions(
    financeData.recurring_transactions,
    financeData.transactions,
    getTodayString(),
    { locBalance: financeData.accounts.bmo_loc, locRate: financeData.settings.loc_rate }
  );
  if (newTransactions.length === 0) return financeData;
  return {
    ...financeData,
    transactions: [...newTransactions, ...financeData.transactions],
  };
}

export function useFinanceDataProvider(): FinanceDataContextValue {
  const [data, setData] = useState<FinanceData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<FinanceData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Load from localStorage + run recurring sync on mount
  useEffect(() => {
    const loaded = loadFinanceData();
    const synced = runSync(loaded);
    setData(synced);
    setIsLoaded(true);
  }, []);

  // Debounced save
  useEffect(() => {
    if (!data || !isLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveFinanceData(data);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, isLoaded]);

  // Flush on visibility change
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && dataRef.current) {
        saveFinanceData(dataRef.current);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // === Transaction mutations ===

  const addTransaction = useCallback(
    (partial: {
      type: TransactionType;
      description: string;
      category: string;
      amount: number;
      account: AccountKey;
      date?: string;
      notes?: string;
    }): Transaction => {
      const txn = createTransaction(partial);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          transactions: [txn, ...prev.transactions],
          accounts: adjustAccount(prev.accounts, txn.account, txn.amount, txn.type, "add"),
        };
      });
      return txn;
    },
    []
  );

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, "id">>) => {
    setData((prev) => {
      if (!prev) return prev;
      const oldTxn = prev.transactions.find((t) => t.id === id);
      let accounts = prev.accounts;

      if (oldTxn && oldTxn.status === "confirmed") {
        accounts = adjustAccount(accounts, oldTxn.account, oldTxn.amount, oldTxn.type, "reverse");
      }

      const newTxn = oldTxn ? { ...oldTxn, ...updates } : null;
      if (newTxn && newTxn.status === "confirmed") {
        accounts = adjustAccount(accounts, newTxn.account, newTxn.amount, newTxn.type, "add");
      }

      return {
        ...prev,
        transactions: updateTransactionInList(prev.transactions, id, updates),
        accounts,
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const txn = prev.transactions.find((t) => t.id === id);
      let accounts = prev.accounts;

      if (txn && txn.status === "confirmed") {
        accounts = adjustAccount(accounts, txn.account, txn.amount, txn.type, "reverse");
      }

      return {
        ...prev,
        transactions: deleteTransactionFromList(prev.transactions, id),
        accounts,
      };
    });
  }, []);

  // === Confirm / Skip / Batch ===

  const confirmTransaction = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const txn = prev.transactions.find((t) => t.id === id);
      if (!txn || txn.status === "confirmed") return prev;

      return {
        ...prev,
        transactions: updateTransactionInList(prev.transactions, id, { status: "confirmed" }),
        accounts: adjustAccount(prev.accounts, txn.account, txn.amount, txn.type, "add"),
      };
    });
  }, []);

  const skipTransaction = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const txn = prev.transactions.find((t) => t.id === id);
      if (!txn) return prev;

      let accounts = prev.accounts;
      // If it was confirmed, reverse the balance effect
      if (txn.status === "confirmed") {
        accounts = adjustAccount(accounts, txn.account, txn.amount, txn.type, "reverse");
      }

      return {
        ...prev,
        transactions: updateTransactionInList(prev.transactions, id, { status: "skipped" }),
        accounts,
      };
    });
  }, []);

  const batchConfirmTransactions = useCallback((ids: string[]) => {
    setData((prev) => {
      if (!prev) return prev;
      let accounts = prev.accounts;
      const idSet = new Set(ids);

      const transactions = prev.transactions.map((t) => {
        if (idSet.has(t.id) && t.status === "pending") {
          accounts = adjustAccount(accounts, t.account, t.amount, t.type, "add");
          return { ...t, status: "confirmed" as const };
        }
        return t;
      });

      return { ...prev, transactions, accounts };
    });
  }, []);

  // === Recurring transaction CRUD ===

  const addRecurringTransaction = useCallback((partial: Omit<RecurringTransaction, "id">) => {
    setData((prev) => {
      if (!prev) return prev;
      const newRec: RecurringTransaction = { ...partial, id: `rec-${generateId()}` };
      const updated = {
        ...prev,
        recurring_transactions: [...prev.recurring_transactions, newRec],
      };
      return runSync(updated);
    });
  }, []);

  const updateRecurringTransaction = useCallback((id: string, updates: Partial<Omit<RecurringTransaction, "id">>) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        recurring_transactions: prev.recurring_transactions.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      };
      return runSync(updated);
    });
  }, []);

  const deleteRecurringTransaction = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recurring_transactions: prev.recurring_transactions.filter((r) => r.id !== id),
        // Remove any pending transactions for this recurring definition
        transactions: prev.transactions.filter(
          (t) => !(t.recurring_id === id && t.status === "pending")
        ),
      };
    });
  }, []);

  const runRecurringSync = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      return runSync(prev);
    });
  }, []);

  // === Quick log button CRUD ===

  const addQuickLogButton = useCallback((button: Omit<QuickLogButton, "id">) => {
    const newButton: QuickLogButton = { ...button, id: `ql-${Date.now()}` };
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, quick_log_buttons: [...prev.quick_log_buttons, newButton] };
    });
  }, []);

  const updateQuickLogButton = useCallback((id: string, updates: Partial<Omit<QuickLogButton, "id">>) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quick_log_buttons: prev.quick_log_buttons.map((b) =>
          b.id === id ? { ...b, ...updates } : b
        ),
      };
    });
  }, []);

  const deleteQuickLogButton = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, quick_log_buttons: prev.quick_log_buttons.filter((b) => b.id !== id) };
    });
  }, []);

  // === Settings / Accounts ===

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, settings: { ...prev.settings, ...updates } };
    });
  }, []);

  const updateAccounts = useCallback((updates: Partial<Accounts>) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, accounts: { ...prev.accounts, ...updates } };
    });
  }, []);

  // === Export / Import ===

  const exportJSON = useCallback(() => {
    if (!data) return "{}";
    return exportData(data);
  }, [data]);

  const importJSONFn = useCallback((json: string): { success: boolean; error?: string } => {
    const result = importData(json);
    if (result.success && result.data) {
      setData(runSync(result.data));
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const setDataFn = useCallback((newData: FinanceData) => {
    setData(newData);
  }, []);

  const defaults = loadFinanceData();

  return {
    data: data || defaults,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    confirmTransaction,
    skipTransaction,
    batchConfirmTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    runRecurringSync,
    addQuickLogButton,
    updateQuickLogButton,
    deleteQuickLogButton,
    updateSettings,
    updateAccounts,
    exportJSON,
    importJSON: importJSONFn,
    setData: setDataFn,
  };
}

export function useFinanceData(): FinanceDataContextValue {
  const ctx = useContext(FinanceDataContext);
  if (!ctx) {
    throw new Error("useFinanceData must be used within a FinanceDataProvider");
  }
  return ctx;
}
