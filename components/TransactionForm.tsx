"use client";

import { useState, useRef, useEffect } from "react";
import type { TransactionType, AccountKey, Transaction } from "@/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CategoryPicker } from "./CategoryPicker";
import { AccountPicker } from "./AccountPicker";
import { getTodayString } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onSubmit: (data: {
    type: TransactionType;
    description: string;
    category: string;
    amount: number;
    account: AccountKey;
    date: string;
    notes: string;
  }) => void;
  onCancel: () => void;
  initialData?: Transaction;
  quickLogDefaults?: {
    type: TransactionType;
    amount: number;
    category: string;
    account: AccountKey;
    description?: string;
  };
}

export function TransactionForm({ onSubmit, onCancel, initialData, quickLogDefaults }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialData?.type || quickLogDefaults?.type || "expense"
  );
  const [amount, setAmount] = useState(
    initialData?.amount?.toString() || (quickLogDefaults?.amount ? quickLogDefaults.amount.toString() : "")
  );
  const [description, setDescription] = useState(
    initialData?.description || quickLogDefaults?.description || ""
  );
  const [category, setCategory] = useState(
    initialData?.category || quickLogDefaults?.category || ""
  );
  const [account, setAccount] = useState<AccountKey>(
    initialData?.account || quickLogDefaults?.account || "cibc_chequing"
  );
  const [date, setDate] = useState(initialData?.date || getTodayString());
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [showNotes, setShowNotes] = useState(!!initialData?.notes);
  const [error, setError] = useState("");

  const amountRef = useRef<HTMLInputElement>(null);

  // Auto-focus amount input (or save button if amount is pre-filled)
  useEffect(() => {
    if (!quickLogDefaults?.amount && !initialData) {
      amountRef.current?.focus();
    }
  }, [quickLogDefaults, initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter a valid amount");
      amountRef.current?.focus();
      return;
    }
    if (!category) {
      setError("Select a category");
      return;
    }

    setError("");
    onSubmit({
      type,
      description,
      category,
      amount: parsedAmount,
      account,
      date,
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Income / Expense Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-semibold text-base transition-colors min-h-[44px]",
            type === "income"
              ? "bg-income text-white"
              : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
          )}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-semibold text-base transition-colors min-h-[44px]",
            type === "expense"
              ? "bg-expense text-white"
              : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
          )}
        >
          Expense
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
            $
          </span>
          <input
            ref={amountRef}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              // Allow only numbers and one decimal point
              const val = e.target.value.replace(/[^0-9.]/g, "");
              if (val.split(".").length <= 2) setAmount(val);
            }}
            placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-3 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-2xl font-bold",
              "dark:border-dark-border dark:bg-dark-card dark:text-gray-100",
              "focus:outline-none focus:ring-2 focus:ring-navy/50 focus:border-navy",
              "min-h-[52px]"
            )}
          />
        </div>
      </div>

      {/* Description */}
      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={type === "income" ? "Income source" : "What did you buy?"}
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <CategoryPicker type={type} selected={category} onSelect={setCategory} />
      </div>

      {/* Account */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account
        </label>
        <AccountPicker selected={account} onSelect={setAccount} />
      </div>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Notes */}
      {showNotes ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 dark:border-dark-border dark:bg-dark-card dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy/50 min-h-[80px] text-base resize-none"
            placeholder="Additional notes..."
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-sm text-navy dark:text-savings-light font-medium"
        >
          + Add notes
        </button>
      )}

      {/* Error */}
      {error && <p className="text-sm text-expense font-medium">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1" type="button">
          Cancel
        </Button>
        <Button
          variant={type === "income" ? "income" : "expense"}
          type="submit"
          className="flex-1"
          size="lg"
        >
          {initialData ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
