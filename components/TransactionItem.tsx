"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ACCOUNT_DISPLAY_NAMES } from "@/lib/constants";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
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

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = categoryIcons[transaction.category] || "📌";
  const isIncome = transaction.type === "income";

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-3 px-1 text-left"
      >
        <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {transaction.description || transaction.category}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge>{transaction.category}</Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {ACCOUNT_DISPLAY_NAMES[transaction.account] || transaction.account}
            </span>
          </div>
        </div>
        <span
          className={`font-bold text-base flex-shrink-0 ${
            isIncome ? "text-income" : "text-expense"
          }`}
        >
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-11 pb-3 flex gap-2">
              {transaction.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 w-full">
                  {transaction.notes}
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(transaction);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(transaction.id);
                }}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
