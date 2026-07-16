import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-accent/40 flex flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed px-4 py-12 text-center ${className}`}
    >
      <Icon className="text-accent mb-2" size={28} aria-hidden="true" />
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="text-accent max-w-sm text-sm">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
