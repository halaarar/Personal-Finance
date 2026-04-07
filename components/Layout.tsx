"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/transactions", label: "Transactions", icon: "📝" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Hala&apos;s Finance</h1>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-1 rounded-lg transition-colors",
                  isActive
                    ? "text-navy dark:text-savings-light"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
