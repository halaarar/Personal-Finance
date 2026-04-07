"use client";

import type { Transaction } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TransactionItem } from "./TransactionItem";
import { Card } from "./ui/Card";

interface TransactionListProps {
  groups: { date: string; transactions: Transaction[] }[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ groups, onEdit, onDelete }: TransactionListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-4xl mb-2">📝</p>
        <p className="font-medium">No transactions yet</p>
        <p className="text-sm mt-1">Tap the + button to add one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const dayIncome = group.transactions
          .filter((t) => t.type === "income" && t.status === "confirmed")
          .reduce((s, t) => s + t.amount, 0);
        const dayExpenses = group.transactions
          .filter((t) => t.type === "expense" && t.status === "confirmed")
          .reduce((s, t) => s + t.amount, 0);
        const dayNet = dayIncome - dayExpenses;

        return (
          <Card key={group.date} className="p-0 overflow-hidden">
            {/* Date header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatDate(group.date)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  dayNet >= 0 ? "text-income" : "text-expense"
                }`}
              >
                {dayNet >= 0 ? "+" : ""}{formatCurrency(dayNet)}
              </span>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-gray-100 dark:divide-dark-border px-3">
              {group.transactions.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  transaction={txn}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
