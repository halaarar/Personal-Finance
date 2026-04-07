# Claude Code Prompt: Personal Finance Dashboard (Final)

Copy and paste everything below this line into Claude Code:

---

## BUILD INSTRUCTIONS (READ FIRST)

**IMPORTANT: Build this app in clearly separated phases. Do NOT attempt to implement everything at once.**

**Phase 1:** Data model, localStorage system, basic transaction logging (no recurring yet). Get CRUD working on transactions with persistence.

**Phase 2:** Recurring transaction engine. Pending/confirm/skip workflow. Auto-generation of expected transactions.

**Phase 3:** Dashboard UI (minimal, functional). Upcoming transactions, this month summary, move fund progress, LOC snapshot.

**Phase 4:** Charts and analytics (use derived selectors, do NOT duplicate calculation logic).

**Phase 5:** What-if simulators (must NOT mutate real data — run on cloned copies only).

**Each phase should be fully working and tested before moving to the next.**

**IMPORTANT: After Phase 3, STOP. Use the app for 3-5 days before building Phase 4-5. You will immediately notice what's annoying, what's missing, and what you thought you needed but don't. Refine before continuing. That's how real products get good.**

**PROJECT STRUCTURE:**

Use a clean, scalable folder structure:
```
/app
/components
/lib          (calculations, utilities, recurring engine)
/hooks        (custom hooks for derived data)
/types
```
Keep ALL business logic (calculations, projections, recurring engine) in `/lib`, NOT inside components. Components only consume these functions.

**CRITICAL RULES:**

1. **Single source of truth.** All totals, balances, projections, and chart data must be derived from transactions + settings. Do NOT store duplicate calculated values in state. Create utility functions or hooks that compute derived values from the raw data.

2. **Reusable calculation layer.** All financial calculations (totals, LOC math, projections, category sums) must live in reusable utility functions in `/lib`. Components must only consume these functions and NEVER reimplement logic. This prevents charts and dashboard from drifting apart.

3. **LOC interest calculation:**
   - Use monthly approximation: balance × (rate / 12)
   - Minimum payment = interest only
   - Extra payments reduce principal
   - Clearly separate interest vs principal in all calculations
   - This is a LINE OF CREDIT with a variable rate, not a fixed-term loan

4. **What-if simulations must run on a cloned copy of the data and must NEVER mutate actual stored data.** Use a separate state or computed values for simulation results.

5. **Recurring generation must be idempotent:**
   - Do NOT rely on a stored "last generated date"
   - Instead, recompute occurrences based on start_date → today
   - Only create transactions that do not already exist (match by recurring_id + date)
   - This prevents duplicate transactions

6. **Performance (critical for mobile):**
   - Use memoization (useMemo) for all derived calculations
   - Avoid recalculating large datasets on every render
   - Ensure smooth 60fps performance on mobile devices

7. **Data protection:**
   - Before saving to localStorage, validate data shape and handle corruption gracefully
   - If data is invalid or corrupted, fall back to a safe default state rather than crashing
   - Never lose user data due to a schema change or bug

8. **Dashboard should prioritize (in this order):**
   - Upcoming recurring transactions (confirm/edit/skip)
   - This month's income vs expenses
   - Move fund progress
   - LOC snapshot (balance, monthly interest, principal reduction)
   - All other details accessible via drill-down or secondary screens

9. **Mobile-first. Frictionless logging.** I should be able to log a transaction in under 10 seconds. This is the most important UX goal.

---

## MY FINANCIAL SITUATION

### Bank Accounts
- **CIBC Chequing (ending 5820):** $153.05 — daily spending account
- **CIBC Credit Card:** -$83.30, due April 14, 2026 — pay this first
- **BMO Chequing:** $2.05 — minimal use
- **BMO Student Line of Credit:** -$45,000. Variable rate: BMO Prime (currently 6.95%) + 1% = **7.95% annually**. Currently in **interest-only repayment period** — minimum payment is just interest (~$298/month), does NOT reduce principal. Only extra payments above interest reduce the $45,000.
- **OSAP:** Amount TBD (editable). **Deferred until June 2026**, NO interest accruing. I plan to defer again. Add countdown to deferral deadline.

### Income Sources
- **Purolator:** $21.56/hr × 15 hrs/week. Starts April 6, 2026. Paid weekly, direct deposit to CIBC.
- **CMS (Jennifer):** Rate TBD (highlight as needing update). 20 hrs/week (9am-1pm Mon-Fri). Paid to CIBC.
- **Tutoring (Tyson):** $35/hr × 2 hrs/week (Mon & Fri). Paid e-transfer or cash to CIBC. **Self-employment income** — track separately, set aside 15% for taxes.

### Fixed Monthly Expenses
- Fido Phone: $59.89 (due 23rd)
- Google Cloud: $1.99
- Apple Storage: $1.99
- Transit: variable, default $0 (editable)
- Groceries/Personal: variable, default $0 (editable)
- BMO LOC Interest: auto-calculated (balance × 7.95% / 12) — mandatory minimum
- No rent (I live at home)

### Budget Split (40/40/20) — applied to money remaining after fixed expenses and LOC interest
- **40% → Extra LOC Payment** (reduces principal)
- **40% → Move Out Fund** (saving for Toronto move)
- **20% → Personal Spending**
- Percentages must be editable and must equal 100%

### Goals
- **Move Out Fund:** $8,000 target (first & last in downtown Toronto + cushion). Currently $0 saved.
- **LOC Payoff:** Show months/years to pay off at current rate.
- **CIBC Credit Card:** $83.30 due April 14 — urgent.

---

## RECURRING TRANSACTION ENGINE (Phase 2 — Core Feature)

This is the most important feature. I do NOT want to re-enter the same income and expenses every week/month.

### How It Works
1. **On app load**, check all active recurring transactions.
2. Calculate all occurrence dates between last generated date and today.
3. For dates without a corresponding transaction (matched by recurring_id + date), generate a new transaction with status: **"pending"**.
4. Pending transactions appear in "Upcoming" on dashboard with distinct styling (dashed border, slightly transparent) and **confirm / edit / skip** buttons.
5. **Confirm**: becomes a real transaction, counted in all totals.
6. **Skip**: marked as "skipped", not counted in totals, visible in history greyed out.
7. **Edit**: change the amount before confirming (e.g. different hours one week).
8. **Batch confirm**: let me confirm multiple pending transactions at once.
9. **Don't generate more than 2 weeks into the future.**

### Default Recurring Transactions
**Income:**
- Purolator: ~$323.40/week, CIBC, weekly starting April 6
- CMS: TBD/week, CIBC, weekly starting March 31 (rate editable)
- Tutoring: $35/session, CIBC, Mon & Fri

**Expenses:**
- Fido Phone: $59.89/month on 23rd, CIBC
- Google Cloud: $1.99/month, CIBC
- Apple Storage: $1.99/month, CIBC
- BMO LOC Interest: auto-calculated/month, BMO

---

## TRANSACTION LOGGING (Phase 1)

- Big button to add transaction
- Toggle: Income / Expense
- Fields: date, description (or source for income), category, amount, account (CIBC/BMO/Cash), notes
- **Quick-log buttons** for common transactions: "Tutoring ($35)", "Coffee ($5)", "Groceries" — one tap, enter amount, done. These should be customizable.
- Expense categories: Phone, Subscriptions, Transit, Groceries, Eating Out, Shopping, Entertainment, Loan Interest, Loan Extra Payment, Move Fund, Other
- Transaction history with search, filter by category/account/date
- Edit or delete any transaction
- **Tutoring tax tracker**: running sum of all tutoring income + 15% set-aside amount shown prominently

---

## DASHBOARD (Phase 3)

**Keep it focused. Only show what I need to act on daily:**

1. **Upcoming transactions** — next 5-7 pending recurring items with confirm/edit/skip
2. **This month actual** — income logged, expenses logged, net
3. **Move fund progress** — bar, amount, target, months to go
4. **LOC snapshot** — balance, monthly interest, total payment, principal reduction, months to payoff
5. **Bank balances** — tap to edit any number
6. **Action items** — urgent reminders (credit card due date, OSAP deferral countdown, CMS rate TBD)

Everything else lives on other screens. Don't overload the dashboard.

---

## ANALYTICS & CHARTS (Phase 4)

Use derived values from transactions — do NOT recalculate or duplicate logic. Create shared utility functions.

**Start with these 3 charts (add more later):**

1. **Income vs Expenses (Line Chart)** — monthly totals, two lines, hoverable data points, date range filter
2. **Spending by Category (Donut Chart)** — current month, tap a slice to see transactions in that category
3. **LOC Balance Over Time (Line Chart)** — shows balance decreasing, projected payoff date

**Add these later if Phase 4 core works well:**

4. Move fund growth with target line
5. Net worth over time
6. Income by source stacked bar
7. Cash flow calendar heatmap

All charts: interactive, touch-friendly, animate on data change, responsive.

---

## WHAT-IF SIMULATORS (Phase 5)

**CRITICAL: Must run on cloned data. Must NEVER mutate stored data.**

### LOC Payoff Simulator
- Slider: extra monthly payment ($0–$2,000)
- Shows: months to payoff, total interest paid, payoff date
- Chart updates in real-time as slider moves
- Comparison: "Paying $X extra saves $Y in interest and Z months"

### Move Fund Simulator
- Slider: monthly contribution ($0–$2,000)
- Shows: months to target, estimated date
- Can change target amount and see effect

### Income Scenario Simulator
- Toggle income sources on/off
- See cascade: budget, split amounts, LOC timeline, move fund timeline
- "What if I get a job at $60K?" — add hypothetical income source

---

## DESIGN

- **Mobile-first.** Thumb-friendly. Minimum 44px tap targets.
- **Color scheme:** Navy headers (#1e3a5f), white cards, green (#16a34a) for income, red (#dc2626) for debt/expenses, blue (#2563eb) for savings, purple (#7c3aed) for personal spending.
- **Dark mode toggle.** Dark grays (#0f172a, #1e293b), not pure black.
- **Fast.** No loading screens. Transaction logging in under 10 seconds.
- **Smooth but subtle animations.** Don't overdo it.
- **Swipe gestures on mobile:** left to delete, right to edit.
- Persistent with localStorage. No auth needed.
- **Export/import** data as JSON for backup.

---

## TECH STACK

- **Next.js** with App Router
- **Tailwind CSS**
- **Recharts** for charts
- **localStorage** for persistence
- **Framer Motion** for animations (keep it subtle)
- **date-fns** for dates
- **PWA support** (add to home screen, works offline)
- Vercel-ready for deployment

---

## DATA MODEL

```typescript
interface FinanceData {
  accounts: {
    cibc_chequing: number;
    cibc_credit: number;
    bmo_chequing: number;
    bmo_loc: number;
    osap: number;
  };

  income_sources: Array<{
    id: string;
    name: string;
    rate: number;
    hours: number;
    active: boolean;
  }>;

  fixed_expenses: Array<{
    id: string;
    name: string;
    amount: number;
    due: string;
  }>;

  recurring_transactions: Array<{
    id: string;
    type: "income" | "expense";
    name: string;
    default_amount: number;
    frequency: "weekly" | "biweekly" | "monthly";
    day_of_week?: number;
    day_of_month?: number;
    account: string;
    category: string;
    start_date: string;
    active: boolean;
    notes: string;
  }>;

  transactions: Array<{
    id: string;
    type: "income" | "expense";
    status: "confirmed" | "pending" | "skipped";
    date: string;
    description: string;
    category: string;
    amount: number;
    account: string;
    notes: string;
    recurring_id?: string;
  }>;

  settings: {
    loc_rate: number;
    split: { loc: number; move: number; personal: number };
    move_target: number;
    move_saved: number;
    osap_deferred_until: string;
    theme: "light" | "dark";
  };

  monthly_snapshots: Array<{
    month: string;
    income: number;
    expenses: number;
    loc_balance: number;
    move_fund: number;
    net_worth: number;
  }>;

  quick_log_buttons: Array<{
    id: string;
    label: string;
    type: "income" | "expense";
    default_amount: number;
    category: string;
    account: string;
  }>;
}
```

---

## REMEMBER

- This is MY app for MY situation. Use my name (Hala). Reference my actual accounts and goals.
- **The #1 priority is: recurring transactions + quick logging + clean dashboard.** If those work perfectly, I've won. Everything else is bonus. Phase 1-3 = 95% of the real value.
- **After Phase 3: STOP and use the app daily for 3-5 days before building Phases 4-5.** Note what's annoying, what's missing, what you don't need. Then refine.
- Build each phase completely before moving on. Test it. Then continue.
- All business logic in `/lib`. Components only consume. Never duplicate calculations.
- Recurring engine must be idempotent — recompute from start_date, don't track "last generated."
- Single source of truth. Derived state via useMemo. No duplicated calculations.
- What-if simulators never touch real data.
- Validate data before saving to localStorage. Handle corruption gracefully.
- LOC is a variable-rate line of credit in interest-only period, not a fixed loan.
- Tutoring is self-employment income. Track separately for taxes.
