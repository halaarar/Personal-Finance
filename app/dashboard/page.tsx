"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFinanceData } from "@/hooks/useFinanceData";
import { Layout } from "@/components/Layout";
import { KPICards } from "@/components/KPICards";
import { PendingTransactions } from "@/components/PendingTransactions";
import { MonthSummaryCard } from "@/components/dashboard/MonthSummaryCard";
import { MoveFundCard } from "@/components/dashboard/MoveFundCard";
import { LOCSnapshotCard } from "@/components/dashboard/LOCSnapshotCard";
import { ActionItems } from "@/components/dashboard/ActionItems";
import { TransactionsSkeleton } from "@/components/ui/Skeleton";
import type { Transaction } from "@/types";

export default function DashboardPage() {
  const {
    data,
    isLoaded,
    confirmTransaction,
    skipTransaction,
    batchConfirmTransactions,
    updateTransaction,
  } = useFinanceData();

  const pendingTransactions = useMemo(
    () =>
      data.transactions
        .filter((t) => t.status === "pending")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 7),
    [data.transactions]
  );

  const totalPending = useMemo(
    () => data.transactions.filter((t) => t.status === "pending").length,
    [data.transactions]
  );

  if (!isLoaded) {
    return (
      <Layout>
        <TransactionsSkeleton />
      </Layout>
    );
  }

  function handleEditPending(txn: Transaction) {
    // For dashboard, confirm with current values (user can go to transactions page for full edit)
    confirmTransaction(txn.id);
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Action Items — top priority */}
        <ActionItems />

        {/* Upcoming Transactions */}
        {pendingTransactions.length > 0 && (
          <div>
            <PendingTransactions
              transactions={pendingTransactions}
              onConfirm={confirmTransaction}
              onSkip={skipTransaction}
              onEdit={handleEditPending}
              onBatchConfirm={batchConfirmTransactions}
            />
            {totalPending > 7 && (
              <Link
                href="/transactions"
                className="block text-center text-sm text-navy dark:text-savings-light font-medium mt-2"
              >
                See all {totalPending} pending →
              </Link>
            )}
          </div>
        )}

        {/* This Month */}
        <MonthSummaryCard />

        {/* Move Fund Progress */}
        <MoveFundCard />

        {/* LOC Snapshot */}
        <LOCSnapshotCard />

        {/* Account Balances */}
        <KPICards />
      </div>
    </Layout>
  );
}
