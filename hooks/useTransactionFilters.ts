"use client";

import { useState, useMemo, useCallback } from "react";
import type { Transaction, TransactionType } from "@/types";
import { filterTransactions, sortTransactionsByDate, groupTransactionsByDate } from "@/lib/transactions";

export interface TransactionFilters {
  search: string;
  category: string;
  account: string;
  month: string;
  type: TransactionType | "";
}

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    category: "",
    account: "",
    month: "",
    type: "",
  });

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setAccount = useCallback((account: string) => {
    setFilters((prev) => ({ ...prev, account }));
  }, []);

  const setMonth = useCallback((month: string) => {
    setFilters((prev) => ({ ...prev, month }));
  }, []);

  const setType = useCallback((type: TransactionType | "") => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", category: "", account: "", month: "", type: "" });
  }, []);

  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, {
      search: filters.search || undefined,
      category: filters.category || undefined,
      account: filters.account || undefined,
      month: filters.month || undefined,
      type: filters.type || undefined,
    });
    return sortTransactionsByDate(filtered);
  }, [transactions, filters]);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const hasActiveFilters = filters.search || filters.category || filters.account || filters.month || filters.type;

  return {
    filters,
    setSearch,
    setCategory,
    setAccount,
    setMonth,
    setType,
    clearFilters,
    filteredTransactions,
    groupedTransactions,
    hasActiveFilters: !!hasActiveFilters,
  };
}
