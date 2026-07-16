"use client";

import { useEffect, useState } from "react";

export function SearchBar({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        className="border-accent min-w-0 flex-1 rounded-[8px] border px-3 py-2"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
      />
      {children}
    </div>
  );
}
