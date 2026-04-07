"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { calculateMonthlyTotals } from "@/lib/calculations";
import { Layout } from "@/components/Layout";
import { QuickLogBar } from "@/components/QuickLogBar";
import { QuickLogEditor } from "@/components/QuickLogEditor";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TutoringTaxCard } from "@/components/TutoringTaxCard";
import { KPICards } from "@/components/KPICards";
import { PendingTransactions } from "@/components/PendingTransactions";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { TransactionsSkeleton } from "@/components/ui/Skeleton";
import type { Transaction, QuickLogButton, TransactionType, AccountKey } from "@/types";

export default function TransactionsPage() {
  const {
    data,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    confirmTransaction,
    skipTransaction,
    batchConfirmTransactions,
    addQuickLogButton,
  } = useFinanceData();

  const {
    filters,
    setSearch,
    setCategory,
    setAccount,
    clearFilters,
    groupedTransactions,
    hasActiveFilters,
  } = useTransactionFilters(data.transactions);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [quickLogDefaults, setQuickLogDefaults] = useState<{
    type: TransactionType;
    amount: number;
    category: string;
    account: AccountKey;
    description?: string;
  } | null>(null);
  const [showQuickLogEditor, setShowQuickLogEditor] = useState(false);

  const monthlyTotals = useMemo(
    () => calculateMonthlyTotals(data.transactions, getCurrentMonth()),
    [data.transactions]
  );

  const pendingTransactions = useMemo(
    () =>
      data.transactions
        .filter((t) => t.status === "pending")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data.transactions]
  );

  if (!isLoaded) {
    return (
      <Layout>
        <TransactionsSkeleton />
      </Layout>
    );
  }

  function handleAddTransaction(formData: {
    type: TransactionType;
    description: string;
    category: string;
    amount: number;
    account: AccountKey;
    date: string;
    notes: string;
  }) {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      addTransaction(formData);
    }
    closeForm();
  }

  function closeForm() {
    setShowForm(false);
    setEditingTransaction(null);
    setQuickLogDefaults(null);
  }

  function handleQuickLog(button: QuickLogButton) {
    setQuickLogDefaults({
      type: button.type,
      amount: button.default_amount,
      category: button.category,
      account: button.account,
      description: button.label,
    });
    setShowForm(true);
  }

  function handleEdit(txn: Transaction) {
    setEditingTransaction(txn);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this transaction?")) {
      deleteTransaction(id);
    }
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Quick Log Bar */}
        <QuickLogBar
          buttons={data.quick_log_buttons}
          onQuickLog={handleQuickLog}
          onAddNew={() => setShowQuickLogEditor(true)}
        />

        {/* KPI Cards */}
        <KPICards />

        {/* This Month Summary */}
        <Card>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">This Month</p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
              <p className="font-bold text-income">{formatCurrency(monthlyTotals.income)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
              <p className="font-bold text-expense">{formatCurrency(monthlyTotals.expenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
              <p className={`font-bold ${monthlyTotals.net >= 0 ? "text-income" : "text-expense"}`}>
                {formatCurrency(monthlyTotals.net)}
              </p>
            </div>
          </div>
        </Card>

        {/* Tutoring Tax */}
        <TutoringTaxCard />

        {/* Upcoming / Pending Transactions */}
        <PendingTransactions
          transactions={pendingTransactions}
          onConfirm={confirmTransaction}
          onSkip={skipTransaction}
          onEdit={handleEdit}
          onBatchConfirm={batchConfirmTransactions}
        />

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onAccountChange={setAccount}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Transaction List */}
        <TransactionList
          groups={groupedTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-navy text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold"
      >
        +
      </motion.button>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={closeForm}
          initialData={editingTransaction || undefined}
          quickLogDefaults={quickLogDefaults || undefined}
        />
      </Modal>

      {/* Quick Log Editor Modal */}
      <Modal
        isOpen={showQuickLogEditor}
        onClose={() => setShowQuickLogEditor(false)}
        title="New Quick Log Button"
      >
        <QuickLogEditor
          onSave={(button) => {
            addQuickLogButton(button);
            setShowQuickLogEditor(false);
          }}
          onCancel={() => setShowQuickLogEditor(false)}
        />
      </Modal>
    </Layout>
  );
}
