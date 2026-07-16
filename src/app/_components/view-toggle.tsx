"use client";

import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "list" | "grid";

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  const options: { mode: ViewMode; label: string; icon: typeof List }[] = [
    { mode: "list", label: "List view", icon: List },
    { mode: "grid", label: "Grid view", icon: LayoutGrid },
  ];

  return (
    <div className="border-accent/40 flex shrink-0 gap-0.5 rounded-[8px] border p-0.5">
      {options.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          aria-label={label}
          title={label}
          className={`rounded-[6px] p-1.5 transition-colors ${
            value === mode
              ? "bg-primary text-secondary"
              : "text-accent hover:bg-primary/5"
          }`}
          onClick={() => onChange(mode)}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
