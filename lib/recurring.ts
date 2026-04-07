import {
  parseISO,
  format,
  addDays,
  addWeeks,
  addMonths,
  getDay,
  getDaysInMonth,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  setDate as setDateOfMonth,
} from "date-fns";
import type { RecurringTransaction, Transaction } from "@/types";
import { createTransaction } from "./transactions";
import { getTodayString } from "./utils";
import { calculateLOCInterest } from "./calculations";

/**
 * Generate all occurrence dates for a recurring transaction
 * from its start_date through endDate.
 */
export function generateOccurrenceDates(
  recurring: RecurringTransaction,
  endDate: string
): string[] {
  const start = startOfDay(parseISO(recurring.start_date));
  const end = startOfDay(parseISO(endDate));
  const dates: string[] = [];

  if (isAfter(start, end)) return dates;

  if (recurring.frequency === "monthly") {
    return generateMonthlyDates(recurring, start, end);
  }

  // Weekly or biweekly — check for multi-day (days_of_week)
  if (recurring.days_of_week && recurring.days_of_week.length > 0) {
    for (const dow of recurring.days_of_week) {
      const dayDates = generateWeeklyDatesForDay(
        start,
        end,
        dow,
        recurring.frequency === "biweekly" ? 2 : 1
      );
      dates.push(...dayDates);
    }
    dates.sort();
    return dates;
  }

  // Single day_of_week
  const dow = recurring.day_of_week ?? getDay(start);
  return generateWeeklyDatesForDay(
    start,
    end,
    dow,
    recurring.frequency === "biweekly" ? 2 : 1
  );
}

function generateWeeklyDatesForDay(
  start: Date,
  end: Date,
  dayOfWeek: number,
  weekStep: number
): string[] {
  const dates: string[] = [];

  // Find first occurrence of dayOfWeek on or after start
  let current = new Date(start);
  while (getDay(current) !== dayOfWeek) {
    current = addDays(current, 1);
  }

  while (!isAfter(current, end)) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = addWeeks(current, weekStep);
  }

  return dates;
}

function generateMonthlyDates(
  recurring: RecurringTransaction,
  start: Date,
  end: Date
): string[] {
  const dates: string[] = [];
  const targetDay = recurring.day_of_month ?? 1;

  // Start from the month of start_date
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (!isAfter(current, end)) {
    const daysInMonth = getDaysInMonth(current);
    const clampedDay = Math.min(targetDay, daysInMonth);
    const occurrenceDate = setDateOfMonth(current, clampedDay);

    if (
      (isAfter(occurrenceDate, start) || isEqual(occurrenceDate, start)) &&
      !isAfter(occurrenceDate, end)
    ) {
      dates.push(format(occurrenceDate, "yyyy-MM-dd"));
    }

    current = addMonths(current, 1);
  }

  return dates;
}

/**
 * Generate pending transactions for occurrence dates that don't already exist.
 * Match by (recurring_id, date) pair.
 */
export function generateMissingTransactions(
  recurring: RecurringTransaction,
  existingTransactions: Transaction[],
  endDate: string,
  overrideAmount?: number
): Transaction[] {
  const dates = generateOccurrenceDates(recurring, endDate);

  // Build set of existing (recurring_id + date) pairs
  const existingDates = new Set(
    existingTransactions
      .filter((t) => t.recurring_id === recurring.id)
      .map((t) => t.date)
  );

  const amount = overrideAmount ?? recurring.default_amount;

  return dates
    .filter((date) => !existingDates.has(date))
    .map((date) =>
      createTransaction({
        type: recurring.type,
        description: recurring.name,
        category: recurring.category,
        amount,
        account: recurring.account,
        date,
        notes: recurring.notes,
        status: "pending",
        recurring_id: recurring.id,
      })
    );
}

/**
 * Main sync function. Returns NEW pending transactions to add.
 * Idempotent — running twice returns empty array on second call.
 */
export function syncRecurringTransactions(
  recurringDefs: RecurringTransaction[],
  existingTransactions: Transaction[],
  today?: string,
  context?: { locBalance?: number; locRate?: number }
): Transaction[] {
  const todayStr = today || getTodayString();
  const endDate = format(addDays(parseISO(todayStr), 14), "yyyy-MM-dd");

  const newTransactions: Transaction[] = [];

  for (const recurring of recurringDefs) {
    if (!recurring.active) continue;

    // Dynamic LOC interest calculation
    let overrideAmount: number | undefined;
    if (
      recurring.category === "Loan Interest" &&
      context?.locBalance !== undefined &&
      context?.locRate !== undefined
    ) {
      overrideAmount = Math.round(
        calculateLOCInterest(context.locBalance, context.locRate) * 100
      ) / 100;
    }

    const missing = generateMissingTransactions(
      recurring,
      existingTransactions,
      endDate,
      overrideAmount
    );
    newTransactions.push(...missing);
  }

  return newTransactions;
}

/**
 * Human-readable frequency description.
 */
export function formatFrequencyDescription(recurring: RecurringTransaction): string {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (recurring.days_of_week && recurring.days_of_week.length > 0) {
    return recurring.days_of_week.map((d) => dayNames[d]).join(" & ");
  }

  if (recurring.frequency === "monthly") {
    const day = recurring.day_of_month ?? 1;
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";
    return `Monthly on the ${day}${suffix}`;
  }

  const dayName = dayNames[recurring.day_of_week ?? 0];
  if (recurring.frequency === "biweekly") {
    return `Every 2 weeks on ${dayName}`;
  }
  return `Every ${dayName}`;
}
