"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-text hover:bg-accent-hover",
  secondary:
    "bg-surface text-text-primary border border-border-subtle hover:bg-surface-2",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface",
};

const sizeStyles: Record<Size, string> = {
  md: "py-2.5 px-4 text-sm",
  lg: "py-4 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}