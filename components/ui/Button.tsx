"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "income" | "expense";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<string, string> = {
  primary: "bg-navy text-white hover:bg-navy-light",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-dark-card dark:text-gray-100 dark:hover:bg-dark-border",
  danger: "bg-expense text-white hover:bg-expense-light",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-card",
  income: "bg-income text-white hover:bg-income-light",
  expense: "bg-expense text-white hover:bg-expense-light",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-base min-h-[44px]",
  lg: "px-6 py-3 text-lg min-h-[48px]",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  disabled,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        "rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy/50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  );
}
