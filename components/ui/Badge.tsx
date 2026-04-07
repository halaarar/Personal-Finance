import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "income" | "expense" | "savings" | "personal";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-dark-border dark:text-gray-300",
  income: "bg-income/10 text-income",
  expense: "bg-expense/10 text-expense",
  savings: "bg-savings/10 text-savings",
  personal: "bg-personal/10 text-personal",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
