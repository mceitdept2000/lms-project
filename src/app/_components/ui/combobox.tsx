"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Spinner } from "~/app/_components/ui/spinner";

export interface ComboboxOption {
  value: string;
  label: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Search...",
  clearLabel,
  loading = false,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  /** If set, shows a leading "clear" option (e.g. "All") that resets value to "". */
  clearLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);
  const allOptions = clearLabel
    ? [{ value: "", label: clearLabel }, ...options]
    : options;
  const filtered = query
    ? allOptions.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : allOptions;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  function select(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlight];
      if (option) select(option);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="border-accent focus-within:border-primary flex items-center gap-1 rounded-[8px] border px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled || loading}
          className="w-full min-w-0 bg-transparent text-sm outline-none disabled:opacity-50"
          placeholder={loading ? "Loading..." : placeholder}
          value={open ? query : (selected?.label ?? clearLabel ?? "")}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {loading ? (
          <Spinner size={14} className="shrink-0" />
        ) : value && clearLabel ? (
          <button
            type="button"
            aria-label="Clear"
            className="text-accent shrink-0"
            onClick={() => {
              onChange("");
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown className="text-accent size-4 shrink-0" aria-hidden="true" />
        )}
      </div>
      {open && !disabled && !loading && (
        <ul
          id={listboxId}
          role="listbox"
          className="border-accent bg-secondary absolute z-20 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-[8px] border py-1 text-sm shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="text-accent px-3 py-2">No matches</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option.value || "__clear__"}
                role="option"
                aria-selected={option.value === value}
                className={`flex cursor-pointer items-center justify-between gap-4 px-3 py-2 ${
                  i === highlight ? "bg-accent/15" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                {option.label}
                {option.value === value && (
                  <Check size={14} className="text-primary shrink-0" />
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
