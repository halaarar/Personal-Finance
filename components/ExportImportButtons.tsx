"use client";

import { useRef } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { Button } from "./ui/Button";
import { format } from "date-fns";

export function ExportImportButtons() {
  const { exportJSON, importJSON } = useFinanceData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hala-finance-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const result = importJSON(json);
      if (result.success) {
        alert("Data imported successfully!");
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={handleExport} className="flex-1">
        Export Backup
      </Button>
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1"
      >
        Import Backup
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
