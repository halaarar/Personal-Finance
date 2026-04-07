"use client";

import { useState } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/components/Layout";
import { ExportImportButtons } from "@/components/ExportImportButtons";
import { RecurringManager } from "@/components/RecurringManager";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ACCOUNT_DISPLAY_NAMES } from "@/lib/constants";
import type { Accounts } from "@/types";

export default function SettingsPage() {
  const {
    data, isLoaded, updateAccounts, updateSettings, deleteQuickLogButton,
    addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
  } = useFinanceData();
  const { theme, toggleTheme } = useTheme();
  const [editingAccounts, setEditingAccounts] = useState(false);
  const [accountValues, setAccountValues] = useState<Record<string, string>>({});

  if (!isLoaded) return <Layout><div className="p-4">Loading...</div></Layout>;

  function startEditAccounts() {
    const vals: Record<string, string> = {};
    for (const [key, val] of Object.entries(data.accounts)) {
      vals[key] = val.toString();
    }
    setAccountValues(vals);
    setEditingAccounts(true);
  }

  function saveAccounts() {
    const updates: Partial<Accounts> = {};
    for (const [key, val] of Object.entries(accountValues)) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        updates[key as keyof Accounts] = num;
      }
    }
    updateAccounts(updates);
    setEditingAccounts(false);
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Theme */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {theme === "dark" ? "On" : "Off"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                theme === "dark" ? "bg-navy" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  theme === "dark" ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Account Balances */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">Account Balances</p>
            {!editingAccounts ? (
              <Button variant="ghost" size="sm" onClick={startEditAccounts}>
                Edit
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={saveAccounts}>
                Save
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {Object.entries(data.accounts).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {ACCOUNT_DISPLAY_NAMES[key] || key}
                </span>
                {editingAccounts ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={accountValues[key] || ""}
                    onChange={(e) =>
                      setAccountValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-28 text-right px-2 py-1 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg text-sm"
                  />
                ) : (
                  <span
                    className={`font-semibold text-sm ${
                      val >= 0 ? "text-income" : "text-expense"
                    }`}
                  >
                    ${val.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Recurring Transactions */}
        <Card>
          <p className="font-medium mb-3">Recurring Transactions</p>
          <RecurringManager
            recurringTransactions={data.recurring_transactions}
            onAdd={addRecurringTransaction}
            onUpdate={updateRecurringTransaction}
            onDelete={deleteRecurringTransaction}
          />
        </Card>

        {/* Budget Split */}
        <Card>
          <p className="font-medium mb-3">Budget Split</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Extra LOC Payment</span>
              <span className="font-semibold text-sm">{data.settings.split.loc}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Move Out Fund</span>
              <span className="font-semibold text-sm">{data.settings.split.move}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Personal Spending</span>
              <span className="font-semibold text-sm">{data.settings.split.personal}%</span>
            </div>
          </div>
        </Card>

        {/* Quick Log Buttons */}
        <Card>
          <p className="font-medium mb-3">Quick Log Buttons</p>
          <div className="space-y-2">
            {data.quick_log_buttons.map((btn) => (
              <div key={btn.id} className="flex items-center justify-between py-1">
                <div>
                  <span className="text-sm font-medium">{btn.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {btn.type === "income" ? "Income" : "Expense"}
                    {btn.default_amount > 0 ? ` · $${btn.default_amount}` : ""}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remove "${btn.label}" quick log button?`)) {
                      deleteQuickLogButton(btn.id);
                    }
                  }}
                  className="text-sm text-expense font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* LOC Settings */}
        <Card>
          <p className="font-medium mb-3">Line of Credit</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Interest Rate</span>
              <span className="font-semibold text-sm">{data.settings.loc_rate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Move Out Target</span>
              <span className="font-semibold text-sm">
                ${data.settings.move_target.toLocaleString("en-CA")}
              </span>
            </div>
          </div>
        </Card>

        {/* Export / Import */}
        <Card>
          <p className="font-medium mb-3">Data</p>
          <ExportImportButtons />
        </Card>
      </div>
    </Layout>
  );
}
