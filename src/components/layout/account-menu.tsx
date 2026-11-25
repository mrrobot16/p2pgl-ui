"use client";

import { LogOut } from "lucide-react";
import { useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useDismiss } from "@/hooks/use-dismiss";
import { forgetAllCompanies, useCompanies } from "@/lib/companies/use-companies";

/**
 * The avatar menu at the right of the top header, with *Sign out*. The old
 * one showed the person's email; gl-node has no `me` yet to name them
 * (docs/api-gaps.md), so it shows the active company's label until then.
 */
export function AccountMenu() {
  const { ready, active } = useCompanies();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerReference = useRef<HTMLDivElement>(null);
  const triggerReference = useRef<HTMLButtonElement>(null);
  useDismiss(containerReference, open, () => setOpen(false), triggerReference);

  if (!ready || !active) {
    return (
      <div className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    );
  }

  function signOut() {
    setSigningOut(true);
    forgetAllCompanies();
    // A full load, so nothing of the signed-in app stays in memory.
    window.location.assign("/sign-in");
  }

  const initial = active.label.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={containerReference}>
      <button
        ref={triggerReference}
        type="button"
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-[var(--color-action-passive-subtle-hover)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((current) => !current)}
      >
        <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-avatar-background)] text-xs font-semibold text-white">
          {initial}
        </div>
        <span className="text-sm font-medium text-[var(--color-text-global)]">{active.label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-lg border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={signOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-global)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)] disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
