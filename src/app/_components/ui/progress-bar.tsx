export function ProgressBar({
  value,
  label,
  className = "",
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-accent/20 h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && <span className="text-accent text-xs">{label}</span>}
    </div>
  );
}
