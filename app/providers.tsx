"use client";

import { FinanceDataContext, useFinanceDataProvider } from "@/hooks/useFinanceData";

export function Providers({ children }: { children: React.ReactNode }) {
  const financeData = useFinanceDataProvider();

  return (
    <FinanceDataContext.Provider value={financeData}>
      {children}
    </FinanceDataContext.Provider>
  );
}
