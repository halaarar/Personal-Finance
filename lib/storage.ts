import type { FinanceData } from "@/types";
import { STORAGE_KEY } from "./constants";
import { getDefaultFinanceData } from "./defaults";
import { validateFinanceData } from "./validation";

export function loadFinanceData(): FinanceData {
  try {
    if (typeof window === "undefined") return getDefaultFinanceData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultFinanceData();
    const parsed = JSON.parse(raw);
    return validateFinanceData(parsed);
  } catch {
    return getDefaultFinanceData();
  }
}

export function saveFinanceData(data: FinanceData): boolean {
  try {
    if (typeof window === "undefined") return false;
    const validated = validateFinanceData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function exportData(data: FinanceData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): { success: boolean; data?: FinanceData; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const validated = validateFinanceData(parsed);
    return { success: true, data: validated };
  } catch {
    return { success: false, error: "Invalid JSON file" };
  }
}
