"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-surface-2 border border-border-subtle rounded-xl min-h-[52px] px-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
}