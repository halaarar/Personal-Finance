"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900",
            "dark:border-dark-border dark:bg-dark-card dark:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-navy/50 focus:border-navy",
            "min-h-[44px] text-base",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            error && "border-expense focus:ring-expense/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-expense">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
