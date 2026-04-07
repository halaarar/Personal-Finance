"use client";

import { useMemo } from "react";
import type { Transaction } from "@/types";
import { calculateTutoringTax } from "@/lib/calculations";

export function useTutoringTax(transactions: Transaction[]) {
  return useMemo(() => calculateTutoringTax(transactions), [transactions]);
}
