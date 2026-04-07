"use client";

import { useEffect, useCallback } from "react";
import type { Theme } from "@/types";
import { useFinanceData } from "./useFinanceData";

export function useTheme() {
  const { data, updateSettings } = useFinanceData();
  const theme = data.settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    updateSettings({ theme: newTheme });
  }, [theme, updateSettings]);

  return { theme, toggleTheme };
}
