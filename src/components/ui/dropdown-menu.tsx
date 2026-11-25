"use client";

import { useRef, useState, type ReactNode } from "react";

import { useDismiss } from "@/hooks/use-dismiss";

export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

type TriggerAttributes = { onClick: () => void; "aria-haspopup": "menu"; "aria-expanded": boolean };

type DropdownMenuProperties = {
  /** Renders the button that opens the menu; spread the attributes onto it. */
  trigger: (attributes: TriggerAttributes) => ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
};

/** A small action menu under a button. Closes on outside click, Escape, or after a choice. */
export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProperties) {
  const [open, setOpen] = useState(false);
  const containerReference = useRef<HTMLDivElement | null>(null);
  useDismiss(containerReference, open, () => setOpen(false));

  return (
    <div ref={containerReference} className="relative inline-block">
      {trigger({ onClick: () => setOpen((current) => !current), "aria-haspopup": "menu", "aria-expanded": open })}
      {open ? (
        <div
          role="menu"
          className={`absolute z-40 mt-1 min-w-[10rem] rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-1 shadow-md ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-action-passive-subtle-hover)] disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
