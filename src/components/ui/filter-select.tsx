"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type FilterSelectProperties = {
  value: string;
  onChange: (value: string) => void;
  /** The <option> elements. */
  children: ReactNode;
  /** Shown in place of the chevron (the date filter's calendar). */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** The accessible name; list toolbars show no visible label. */
  label: string;
  className?: string;
  disabled?: boolean;
};

/** A bordered native select with a chevron: the list screens' toolbar filters. */
export function FilterSelect({ value, onChange, children, icon: Icon, label, className, disabled = false }: FilterSelectProperties) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-[38px] w-full appearance-none rounded border border-[var(--color-input-border-primary)] bg-[var(--color-input-background)] pl-3 pr-14 text-sm text-[var(--color-input-text)] focus:outline-none focus-visible:border-[var(--override-focus)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-[var(--color-icon-secondary)]">
        {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
      </span>
    </div>
  );
}
