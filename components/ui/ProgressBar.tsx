interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
}

export function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1 w-full rounded-full bg-surface-2 ${className}`}>
      <div
        className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
