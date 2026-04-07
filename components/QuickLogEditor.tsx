"use client";

import { useState } from "react";
import type { TransactionType, AccountKey, QuickLogButton } from "@/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CategoryPicker } from "./CategoryPicker";
import { AccountPicker } from "./AccountPicker";
import { cn } from "@/lib/utils";

interface QuickLogEditorProps {
  onSave: (button: Omit<QuickLogButton, "id">) => void;
  onCancel: () => void;
  initialData?: QuickLogButton;
}

export function QuickLogEditor({ onSave, onCancel, initialData }: QuickLogEditorProps) {
  const [label, setLabel] = useState(initialData?.label || "");
  const [type, setType] = useState<TransactionType>(initialData?.type || "expense");
  const [amount, setAmount] = useState(initialData?.default_amount?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [account, setAccount] = useState<AccountKey>(initialData?.account || "cibc_chequing");
  const [error, setError] = useState("");

  function handleSave() {
    if (!label.trim()) {
      setError("Enter a label");
      return;
    }
    if (!category) {
      setError("Select a category");
      return;
    }
    setError("");
    onSave({
      label: label.trim(),
      type,
      default_amount: parseFloat(amount) || 0,
      category,
      account,
    });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Button label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g., Coffee, Tutoring"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 py-2 rounded-xl font-semibold text-sm transition-colors min-h-[44px]",
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
            "flex-1 py-2 rounded-xl font-semibold text-sm transition-colors min-h-[44px]",
            type === "expense"
              ? "bg-expense text-white"
              : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
          )}
        >
          Expense
        </button>
      </div>

      <Input
        label="Default amount (0 = ask each time)"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <CategoryPicker type={type} selected={category} onSelect={setCategory} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account
        </label>
        <AccountPicker selected={account} onSelect={setAccount} />
      </div>

      {error && <p className="text-sm text-expense font-medium">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} className="flex-1">
          {initialData ? "Update" : "Add Button"}
        </Button>
      </div>
    </div>
  );
}
