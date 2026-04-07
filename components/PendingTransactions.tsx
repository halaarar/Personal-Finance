"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ACCOUNT_DISPLAY_NAMES } from "@/lib/constants";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";

interface PendingTransactionsProps {
  transactions: Transaction[];
  onConfirm: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onBatchConfirm: (ids: string[]) => void;
}

const categoryIcons: Record<string, string> = {
  Phone: "📱",
  Subscriptions: "📦",
  Transit: "🚌",
  Groceries: "🛒",
  "Eating Out": "☕",
  Shopping: "🛍️",
  Entertainment: "🎬",
  "Loan Interest": "🏦",
  "Loan Extra Payment": "💰",
  "Move Fund": "🏠",
  Salary: "💼",
  Tutoring: "📚",
  Other: "📌",
};

export function PendingTransactions({
  transactions,
  onConfirm,
  onSkip,
  onEdit,
  onBatchConfirm,
}: PendingTransactionsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (transactions.length === 0) return null;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBatchConfirm() {
    onBatchConfirm(Array.from(selected));
    setSelected(new Set());
  }

  function selectAll() {
    if (selected.size === transactions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((t) => t.id)));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upcoming</h3>
          <Badge variant="default">{transactions.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="income" size="sm" onClick={handleBatchConfirm}>
              Confirm ({selected.size})
            </Button>
          )}
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-navy dark:text-savings-light font-medium"
          >
            {selected.size === transactions.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((txn) => {
          const icon = categoryIcons[txn.category] || "📌";
          const isIncome = txn.type === "income";
          const isSelected = selected.has(txn.id);

          return (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={cn(
                  "p-3 border-dashed opacity-90",
                  isSelected && "ring-2 ring-navy dark:ring-savings-light"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(txn.id)}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-dark-border flex items-center justify-center flex-shrink-0"
                  >
                    {isSelected && (
                      <span className="text-navy dark:text-savings-light text-xs font-bold">✓</span>
                    )}
                  </button>

                  {/* Icon */}
                  <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {txn.description}
                      </p>
                      <span
                        className={cn(
                          "font-bold text-sm flex-shrink-0 ml-2",
                          isIncome ? "text-income" : "text-expense"
                        )}
                      >
                        {isIncome ? "+" : "-"}{formatCurrency(txn.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(txn.date)}
                      </span>
                      <span className="text-gray-300 dark:text-dark-border">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ACCOUNT_DISPLAY_NAMES[txn.account]}
                      </span>
                      <Badge>{txn.category}</Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="income"
                        size="sm"
                        onClick={() => onConfirm(txn.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(txn)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSkip(txn.id)}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
