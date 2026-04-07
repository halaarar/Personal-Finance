"use client";

import { useState } from "react";
import type { RecurringTransaction, TransactionType, AccountKey, Frequency } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatFrequencyDescription } from "@/lib/recurring";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { CategoryPicker } from "./CategoryPicker";
import { AccountPicker } from "./AccountPicker";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";

interface RecurringManagerProps {
  recurringTransactions: RecurringTransaction[];
  onAdd: (partial: Omit<RecurringTransaction, "id">) => void;
  onUpdate: (id: string, updates: Partial<Omit<RecurringTransaction, "id">>) => void;
  onDelete: (id: string) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RecurringManager({
  recurringTransactions,
  onAdd,
  onUpdate,
  onDelete,
}: RecurringManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  function handleEdit(rec: RecurringTransaction) {
    setEditing(rec);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="space-y-2">
      {recurringTransactions.map((rec) => (
        <div
          key={rec.id}
          className={cn(
            "flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0",
            !rec.active && "opacity-50"
          )}
        >
          <div className="flex-1 min-w-0" onClick={() => handleEdit(rec)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{rec.name}</span>
              <Badge variant={rec.type === "income" ? "income" : "expense"}>
                {rec.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatFrequencyDescription(rec)}
              </span>
              <span className="text-gray-300 dark:text-dark-border">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {rec.default_amount > 0
                  ? formatCurrency(rec.default_amount)
                  : rec.category === "Loan Interest"
                    ? "Auto-calc"
                    : "TBD"}
              </span>
            </div>
          </div>

          {/* Active toggle */}
          <button
            onClick={() => onUpdate(rec.id, { active: !rec.active })}
            className={cn(
              "w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ml-2",
              rec.active ? "bg-income" : "bg-gray-300 dark:bg-dark-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                rec.active ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        fullWidth
      >
        + Add Recurring Transaction
      </Button>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editing ? "Edit Recurring" : "New Recurring Transaction"}
      >
        <RecurringForm
          initialData={editing}
          onSave={(data) => {
            if (editing) {
              onUpdate(editing.id, data);
            } else {
              onAdd(data);
            }
            handleCloseForm();
          }}
          onDelete={
            editing
              ? () => {
                  if (confirm(`Delete "${editing.name}" recurring transaction?`)) {
                    onDelete(editing.id);
                    handleCloseForm();
                  }
                }
              : undefined
          }
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
}

// --- Recurring Form ---

interface RecurringFormProps {
  initialData: RecurringTransaction | null;
  onSave: (data: Omit<RecurringTransaction, "id">) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function RecurringForm({ initialData, onSave, onDelete, onCancel }: RecurringFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<TransactionType>(initialData?.type || "expense");
  const [amount, setAmount] = useState(initialData?.default_amount?.toString() || "");
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || "weekly");
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialData?.day_of_week ?? 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialData?.days_of_week || []);
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.day_of_month?.toString() || "1");
  const [multiDay, setMultiDay] = useState((initialData?.days_of_week?.length ?? 0) > 0);
  const [account, setAccount] = useState<AccountKey>(initialData?.account || "cibc_chequing");
  const [category, setCategory] = useState(initialData?.category || "");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [error, setError] = useState("");

  function toggleDayOfWeek(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSave() {
    if (!name.trim()) { setError("Enter a name"); return; }
    if (!category) { setError("Select a category"); return; }
    if (!startDate) { setError("Enter a start date"); return; }

    setError("");
    onSave({
      name: name.trim(),
      type,
      default_amount: parseFloat(amount) || 0,
      frequency,
      day_of_week: frequency !== "monthly" && !multiDay ? dayOfWeek : undefined,
      days_of_week: frequency !== "monthly" && multiDay ? daysOfWeek : undefined,
      day_of_month: frequency === "monthly" ? parseInt(dayOfMonth) || 1 : undefined,
      account,
      category,
      start_date: startDate,
      active,
      notes,
    });
  }

  return (
    <div className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Purolator" />

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 py-2 rounded-xl font-semibold text-sm transition-colors min-h-[44px]",
            type === "income" ? "bg-income text-white" : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
          )}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 py-2 rounded-xl font-semibold text-sm transition-colors min-h-[44px]",
            type === "expense" ? "bg-expense text-white" : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
          )}
        >
          Expense
        </button>
      </div>

      <Input
        label="Default amount (0 = calculated or TBD)"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
      />

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
        <div className="flex gap-2">
          {(["weekly", "biweekly", "monthly"] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] capitalize",
                frequency === f ? "bg-navy text-white" : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Day picker */}
      {frequency !== "monthly" ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {multiDay ? "Days" : "Day of week"}
            </label>
            <button
              type="button"
              onClick={() => setMultiDay(!multiDay)}
              className="text-xs text-navy dark:text-savings-light font-medium"
            >
              {multiDay ? "Single day" : "Multiple days"}
            </button>
          </div>
          <div className="flex gap-1.5">
            {DAY_NAMES.map((d, i) => {
              const isActive = multiDay ? daysOfWeek.includes(i) : dayOfWeek === i;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => (multiDay ? toggleDayOfWeek(i) : setDayOfWeek(i))}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px]",
                    isActive ? "bg-navy text-white" : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <Input
          label="Day of month"
          type="number"
          inputMode="numeric"
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
          placeholder="1-31"
        />
      )}

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <CategoryPicker type={type} selected={category} onSelect={setCategory} />
      </div>

      {/* Account */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
        <AccountPicker selected={account} onSelect={setAccount} />
      </div>

      <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />

      {error && <p className="text-sm text-expense font-medium">{error}</p>}

      <div className="flex gap-2 pt-2">
        {onDelete && (
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} className="flex-1">
          {initialData ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
}
