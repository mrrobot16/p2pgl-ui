"use client";

import Link from "next/link";
import type { AppCategory } from "@/lib/navigation/apps";

type CategoryFlyoutProperties = {
  category: AppCategory;
  onNavigate: () => void;
};

/** The list a rail category opens on hover or focus: every page in it. */
export function CategoryFlyout({ category, onNavigate }: CategoryFlyoutProperties) {
  return (
    <div
      role="menu"
      aria-label={category.label}
      className="w-64 rounded-lg border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-2 shadow-lg"
    >
      <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-icon-secondary)]">{category.label}</p>
      {category.items.map((item) => {
        const ItemIcon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-global)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)]"
          >
            <ItemIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
